// Replit DB wrapper  -  SERVER-ONLY.
//
// Replit injects REPLIT_DB_URL at runtime (NOT at build time), so this module
// must only be imported from server code paths (API routes, server actions,
// server components). The `server-only` import throws a compile-time error if
// a client component tries to pull it in.
//
// Key schema (lexicographic ordering by ISO timestamp gives us recency ordering
// for free):
//
//   signup:<ISO8601>:<randHex>       -> JSON SignupRecord
//   quiz:<ISO8601>:<randHex>         -> JSON QuizRecord
//   donor_interest:<ISO8601>:<randHex> -> JSON (subset of SignupRecord)
//   analytics_event:<ISO8601>:<randHex> -> JSON AnalyticsEvent (server-tracked only)
//
// Replit DB is eventually consistent and has a 5 MB per-value cap, which is
// plenty for form submissions. For list-all queries we use the prefix list API.

import "server-only";

import Database from "@replit/database";

type DbClient = InstanceType<typeof Database>;

// The Replit Database client demands REPLIT_DB_URL at construction time and
// that env var is only injected when the app is *running* on Replit, not at
// build time or during local `next build`. Defer instantiation so local
// builds and environments without the URL still succeed  -  admin endpoints
// will fail at request time with a clear error instead of at module load.
let _db: DbClient | null = null;
function db(): DbClient {
  if (_db) return _db;
  const url = process.env.REPLIT_DB_URL;
  if (!url) {
    throw new Error(
      "REPLIT_DB_URL is not set. This endpoint requires Replit Database and will only work when deployed on Replit.",
    );
  }
  _db = new Database(url);
  return _db;
}

export type SignupTag = "volunteer" | "donor" | "press" | "general";

export interface SignupRecord {
  id: string;                  // the full key (e.g. "signup:2026-04-16T20:28:00.123Z:a1b2c3")
  tag: SignupTag;
  email: string;
  firstName?: string;
  lastName?: string;
  fields?: Record<string, string>;
  sourcePage?: string;
  userAgent?: string;
  ipCountry?: string;          // from Replit's Cloudflare edge headers
  ipRegion?: string;           // e.g. "SC"
  ipCity?: string;             // best-effort, not reliable for small towns
  convertkitStatus: "pending" | "ok" | "error";
  convertkitError?: string;
  createdAt: string;           // ISO8601, same as embedded in key
}

export interface QuizRecord {
  id: string;
  email?: string;              // only if they completed the email gate
  answers: Record<string, string>; // q1..q10 -> "yes" | "no" | "unsure"
  scoreCore: number;           // 0..6 alignment count on core questions
  scoreExtended?: number;      // 0..4 if they did extended
  completedExtended: boolean;
  sourcePage?: string;
  userAgent?: string;
  ipRegion?: string;
  createdAt: string;
}

function randHex(bytes = 6): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function makeKey(prefix: string, timestamp = new Date()): string {
  return `${prefix}:${timestamp.toISOString()}:${randHex()}`;
}

export async function putSignup(
  record: Omit<SignupRecord, "id" | "createdAt">,
): Promise<SignupRecord> {
  const now = new Date();
  const id = makeKey("signup", now);
  const full: SignupRecord = { ...record, id, createdAt: now.toISOString() };
  await db().set(id, full);
  return full;
}

export async function updateSignupStatus(
  id: string,
  status: SignupRecord["convertkitStatus"],
  error?: string,
): Promise<void> {
  const res = await db().get(id);
  if (!res.ok || !res.value) return;
  const existing = res.value as SignupRecord;
  const next: SignupRecord = {
    ...existing,
    convertkitStatus: status,
    ...(error ? { convertkitError: error } : {}),
  };
  await db().set(id, next);
}

async function getMany<T>(keys: string[]): Promise<T[]> {
  if (keys.length === 0) return [];
  // Replit DB client has no batch-get primitive; fan out with modest
  // concurrency to stay friendly to the key-value backend.
  const results: T[] = [];
  const CHUNK = 25;
  for (let i = 0; i < keys.length; i += CHUNK) {
    const chunk = keys.slice(i, i + CHUNK);
    const settled = await Promise.all(chunk.map((k) => db().get(k)));
    for (const r of settled) {
      if (r.ok && r.value) results.push(r.value as T);
    }
  }
  return results;
}

export async function listSignups(opts?: {
  tag?: SignupTag;
  since?: Date;
  limit?: number;
}): Promise<SignupRecord[]> {
  const res = await db().list("signup:");
  if (!res.ok) return [];
  const keys = res.value ?? [];
  // Newest first (ISO timestamps sort lexicographically).
  keys.sort().reverse();
  // Fetch ~3x the cap so we have room after filtering by tag/since.
  const capped = opts?.limit ? keys.slice(0, opts.limit * 3) : keys;
  const records = await getMany<SignupRecord>(capped);
  let filtered = records;
  if (opts?.tag) filtered = filtered.filter((r) => r.tag === opts.tag);
  if (opts?.since) {
    const sinceIso = opts.since.toISOString();
    filtered = filtered.filter((r) => r.createdAt >= sinceIso);
  }
  if (opts?.limit) filtered = filtered.slice(0, opts.limit);
  return filtered;
}

export async function putQuizRecord(
  record: Omit<QuizRecord, "id" | "createdAt">,
): Promise<QuizRecord> {
  const now = new Date();
  const id = makeKey("quiz", now);
  const full: QuizRecord = { ...record, id, createdAt: now.toISOString() };
  await db().set(id, full);
  return full;
}

export async function listQuizRecords(opts?: {
  since?: Date;
  limit?: number;
}): Promise<QuizRecord[]> {
  const res = await db().list("quiz:");
  if (!res.ok) return [];
  const keys = res.value ?? [];
  keys.sort().reverse();
  const capped = opts?.limit ? keys.slice(0, opts.limit * 2) : keys;
  const records = await getMany<QuizRecord>(capped);
  let filtered = records;
  if (opts?.since) {
    const sinceIso = opts.since.toISOString();
    filtered = filtered.filter((r) => r.createdAt >= sinceIso);
  }
  if (opts?.limit) filtered = filtered.slice(0, opts.limit);
  return filtered;
}

/**
 * Returns counts useful for admin KPIs without loading every record into memory.
 * Still O(n) in key count since Replit DB has no aggregation primitives.
 */
export async function getCounts(): Promise<{
  signups: { total: number; byTag: Record<SignupTag, number> };
  quiz: { total: number; withEmail: number; extendedComplete: number };
}> {
  const [signupRes, quizRes] = await Promise.all([
    db().list("signup:"),
    db().list("quiz:"),
  ]);

  const signupKeys = signupRes.ok ? (signupRes.value ?? []) : [];
  const quizKeys = quizRes.ok ? (quizRes.value ?? []) : [];

  const byTag: Record<SignupTag, number> = {
    volunteer: 0,
    donor: 0,
    press: 0,
    general: 0,
  };

  if (signupKeys.length > 0) {
    const signups = await getMany<SignupRecord>(signupKeys);
    for (const r of signups) {
      if (r?.tag && byTag[r.tag] !== undefined) byTag[r.tag]++;
    }
  }

  let withEmail = 0;
  let extendedComplete = 0;
  if (quizKeys.length > 0) {
    const quizzes = await getMany<QuizRecord>(quizKeys);
    for (const r of quizzes) {
      if (r?.email) withEmail++;
      if (r?.completedExtended) extendedComplete++;
    }
  }

  return {
    signups: { total: signupKeys.length, byTag },
    quiz: { total: quizKeys.length, withEmail, extendedComplete },
  };
}
