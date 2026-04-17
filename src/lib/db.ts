// Postgres-backed data layer  -  SERVER-ONLY.
//
// Replaced the Replit key-value database because REPLIT_DB_URL is only
// injected into the workspace, not into autoscale deployments, which
// broke the production admin dashboard. DATABASE_URL is auto-provisioned
// by Replit in both dev and deployment, so Postgres is the durable
// storage layer through the Nov 3 2026 election with no token rotation
// or manual secret management.
//
// The public API of this module is unchanged. Every caller
// (putSignup, updateSignupStatus, listSignups, putQuizRecord,
// listQuizRecords, getCounts) keeps the same signature, so the
// /api/subscribe, /api/quiz, and /api/admin/* routes require no
// further changes.
//
// Schema is deliberately minimal. Each row stores a generated id, a
// created_at timestamp (indexed for sort), and the full record payload
// as JSONB. We avoid a rigid column-per-field schema so new fields on
// SignupRecord / QuizRecord don't require migrations; Postgres JSONB
// queries are fast enough at campaign-volume (thousands of rows, not
// millions). Filtering still happens in SQL where it matters (the
// signup tag on listSignups); anything more exotic lives in memory,
// same as the Replit KV version.
//
// Tables are created idempotently on first connection via
// CREATE TABLE IF NOT EXISTS. No separate migration tooling is
// required; deploy the code and the first request wires the schema.

import "server-only";

import { Pool, type PoolClient } from "pg";

export type SignupTag = "volunteer" | "donor" | "press" | "general";

export interface SignupRecord {
  id: string;                  // e.g. "signup:2026-04-16T20:28:00.123Z:a1b2c3"
  tag: SignupTag;
  email: string;
  firstName?: string;
  lastName?: string;
  fields?: Record<string, string>;
  sourcePage?: string;
  userAgent?: string;
  ipCountry?: string;
  ipRegion?: string;
  ipCity?: string;
  convertkitStatus: "pending" | "ok" | "error";
  convertkitError?: string;
  createdAt: string;           // ISO8601
}

export interface QuizRecord {
  id: string;
  email?: string;              // only if they completed the email gate
  answers: Record<string, string>; // q1..q13 -> "yes" | "no" | "unsure"
  scoreCore: number;           // 0..8 alignment count on core questions
  scoreExtended?: number;      // 0..5 if they did extended
  completedExtended: boolean;
  sourcePage?: string;
  userAgent?: string;
  ipRegion?: string;
  createdAt: string;
}

// Lazy pool so local builds without DATABASE_URL still compile. The
// first query call will fail loudly if the env var is missing, which
// is exactly what we want in production (fail fast, not silently).
let _pool: Pool | null = null;
let _schemaReady: Promise<void> | null = null;

function pool(): Pool {
  if (_pool) return _pool;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Postgres is required for admin and signup persistence.",
    );
  }
  _pool = new Pool({
    connectionString: url,
    // Replit Postgres uses TLS with a self-signed chain; the driver
    // accepts it when we skip strict cert verification. The connection
    // is still encrypted end-to-end.
    ssl: url.includes("localhost") ? false : { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000,
  });
  return _pool;
}

// Runs once per process. Creates both tables with IF NOT EXISTS so
// repeat deploys are a no-op. Also creates the indexes we need for
// newest-first listing and tag filtering.
async function ensureSchema(): Promise<void> {
  if (_schemaReady) return _schemaReady;
  _schemaReady = (async () => {
    const client = await pool().connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS signups (
          id          TEXT PRIMARY KEY,
          tag         TEXT NOT NULL,
          email       TEXT NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL,
          data        JSONB NOT NULL
        );
      `);
      // Idempotent column adds. If an earlier deploy created the table
      // with a different schema, CREATE TABLE IF NOT EXISTS above is a
      // no-op and we'd be missing the columns we now expect. ADD COLUMN
      // IF NOT EXISTS covers the drift without requiring manual SQL.
      await client.query(`ALTER TABLE signups ADD COLUMN IF NOT EXISTS tag TEXT;`);
      await client.query(`ALTER TABLE signups ADD COLUMN IF NOT EXISTS email TEXT;`);
      await client.query(`ALTER TABLE signups ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;`);
      await client.query(`ALTER TABLE signups ADD COLUMN IF NOT EXISTS data JSONB;`);
      await client.query(
        `CREATE INDEX IF NOT EXISTS signups_created_at_idx ON signups (created_at DESC);`,
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS signups_tag_idx ON signups (tag);`,
      );
      await client.query(`
        CREATE TABLE IF NOT EXISTS quiz_records (
          id          TEXT PRIMARY KEY,
          email       TEXT,
          created_at  TIMESTAMPTZ NOT NULL,
          data        JSONB NOT NULL
        );
      `);
      await client.query(`ALTER TABLE quiz_records ADD COLUMN IF NOT EXISTS email TEXT;`);
      await client.query(`ALTER TABLE quiz_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;`);
      await client.query(`ALTER TABLE quiz_records ADD COLUMN IF NOT EXISTS data JSONB;`);
      await client.query(
        `CREATE INDEX IF NOT EXISTS quiz_records_created_at_idx ON quiz_records (created_at DESC);`,
      );

      // Drop NOT NULL on any legacy columns left over from earlier schemas
      // (e.g. an older "answers" NOT NULL column that the current code no
      // longer writes to). Only id and created_at stay required, since every
      // new insert supplies both.
      await client.query(`
        DO $$
        DECLARE col record;
        BEGIN
          FOR col IN
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'quiz_records'
              AND is_nullable = 'NO'
              AND column_name NOT IN ('id', 'created_at')
          LOOP
            EXECUTE format('ALTER TABLE quiz_records ALTER COLUMN %I DROP NOT NULL', col.column_name);
          END LOOP;
          FOR col IN
            SELECT column_name FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'signups'
              AND is_nullable = 'NO'
              AND column_name NOT IN ('id', 'tag', 'email', 'created_at')
          LOOP
            EXECUTE format('ALTER TABLE signups ALTER COLUMN %I DROP NOT NULL', col.column_name);
          END LOOP;
        END $$;
      `);
    } finally {
      client.release();
    }
  })().catch((err) => {
    // On failure, clear the cached promise so a subsequent call retries
    // instead of forever returning the same rejection.
    _schemaReady = null;
    throw err;
  });
  return _schemaReady;
}

async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  await ensureSchema();
  const client = await pool().connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
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
  const full: SignupRecord = {
    ...record,
    id,
    createdAt: now.toISOString(),
  };
  await withClient((client) =>
    client.query(
      `INSERT INTO signups (id, tag, email, created_at, data)
       VALUES ($1, $2, $3, $4, $5)`,
      [full.id, full.tag, full.email, now, full],
    ),
  );
  return full;
}

export async function updateSignupStatus(
  id: string,
  status: SignupRecord["convertkitStatus"],
  error?: string,
): Promise<void> {
  await withClient(async (client) => {
    const res = await client.query<{ data: SignupRecord }>(
      `SELECT data FROM signups WHERE id = $1`,
      [id],
    );
    if (res.rows.length === 0) return;
    const existing = res.rows[0].data;
    const next: SignupRecord = {
      ...existing,
      convertkitStatus: status,
      ...(error ? { convertkitError: error } : {}),
    };
    await client.query(
      `UPDATE signups SET data = $2 WHERE id = $1`,
      [id, next],
    );
  });
}

export async function listSignups(opts?: {
  tag?: SignupTag;
  since?: Date;
  limit?: number;
}): Promise<SignupRecord[]> {
  const conds: string[] = [];
  const params: unknown[] = [];
  if (opts?.tag) {
    params.push(opts.tag);
    conds.push(`tag = $${params.length}`);
  }
  if (opts?.since) {
    params.push(opts.since);
    conds.push(`created_at >= $${params.length}`);
  }
  const where = conds.length > 0 ? `WHERE ${conds.join(" AND ")}` : "";
  const limitClause = opts?.limit
    ? `LIMIT ${Math.min(Math.floor(opts.limit), 10_000)}`
    : "";
  const rows = await withClient((client) =>
    client.query<{ data: SignupRecord }>(
      `SELECT data FROM signups ${where}
       ORDER BY created_at DESC ${limitClause}`,
      params,
    ),
  );
  return rows.rows.map((r) => r.data);
}

export async function putQuizRecord(
  record: Omit<QuizRecord, "id" | "createdAt">,
): Promise<QuizRecord> {
  const now = new Date();
  const id = makeKey("quiz", now);
  const full: QuizRecord = {
    ...record,
    id,
    createdAt: now.toISOString(),
  };
  await withClient((client) =>
    client.query(
      `INSERT INTO quiz_records (id, email, created_at, data)
       VALUES ($1, $2, $3, $4)`,
      [full.id, full.email ?? null, now, full],
    ),
  );
  return full;
}

export async function listQuizRecords(opts?: {
  since?: Date;
  limit?: number;
}): Promise<QuizRecord[]> {
  const conds: string[] = [];
  const params: unknown[] = [];
  if (opts?.since) {
    params.push(opts.since);
    conds.push(`created_at >= $${params.length}`);
  }
  const where = conds.length > 0 ? `WHERE ${conds.join(" AND ")}` : "";
  const limitClause = opts?.limit
    ? `LIMIT ${Math.min(Math.floor(opts.limit), 10_000)}`
    : "";
  const rows = await withClient((client) =>
    client.query<{ data: QuizRecord }>(
      `SELECT data FROM quiz_records ${where}
       ORDER BY created_at DESC ${limitClause}`,
      params,
    ),
  );
  return rows.rows.map((r) => r.data);
}

/**
 * Returns counts useful for admin KPIs. SQL-aggregated so we never load
 * the full record set into memory just to count it.
 */
export async function getCounts(): Promise<{
  signups: { total: number; byTag: Record<SignupTag, number> };
  quiz: { total: number; withEmail: number; extendedComplete: number };
}> {
  return withClient(async (client) => {
    const [signupTotalRes, signupTagRes, quizStatsRes] = await Promise.all([
      client.query<{ count: string }>(`SELECT COUNT(*)::text AS count FROM signups`),
      client.query<{ tag: string; count: string }>(
        `SELECT tag, COUNT(*)::text AS count FROM signups GROUP BY tag`,
      ),
      client.query<{
        total: string;
        with_email: string;
        extended_complete: string;
      }>(`
        SELECT
          COUNT(*)::text AS total,
          COUNT(email)::text AS with_email,
          COUNT(*) FILTER (
            WHERE (data->>'completedExtended')::boolean = TRUE
          )::text AS extended_complete
        FROM quiz_records
      `),
    ]);

    const byTag: Record<SignupTag, number> = {
      volunteer: 0,
      donor: 0,
      press: 0,
      general: 0,
    };
    for (const row of signupTagRes.rows) {
      if (row.tag in byTag) {
        byTag[row.tag as SignupTag] = Number(row.count);
      }
    }

    const quizStats = quizStatsRes.rows[0];
    return {
      signups: {
        total: Number(signupTotalRes.rows[0].count),
        byTag,
      },
      quiz: {
        total: Number(quizStats?.total ?? 0),
        withEmail: Number(quizStats?.with_email ?? 0),
        extendedComplete: Number(quizStats?.extended_complete ?? 0),
      },
    };
  });
}
