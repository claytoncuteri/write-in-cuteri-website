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
  // Which Kit tags were actually applied on the most recent sync
  // attempt. Populated by convertkit.ts after Step 3 finishes. Lets
  // the admin table show "SC01-All, SC01-Volunteer, SC01-Resident"
  // per row instead of just an opaque ok/err badge, and lets us
  // confirm a retry actually re-tagged.
  convertkitTagsApplied?: string[];
  // Kit sequences the subscriber has been added to via the admin's
  // "Follow up" action. Append-only history so we can see when + which.
  convertkitSequenceHistory?: Array<{
    sequenceId: number;
    sequenceName: string;
    addedAt: string;
    status: "ok" | "error";
    error?: string;
  }>;
  createdAt: string;           // ISO8601
}

export interface DonationRecord {
  id: string;                    // "donation:<iso>:<hex>"
  amount: number;                // dollars, not cents
  currency: string;              // "USD"
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  // Recurring: null / one-time OR "monthly" / "annual"
  recurring?: string;
  // Provider-side identifier. Anedot returns a UUID or numeric id
  // depending on integration mode. Used to dedupe on re-delivery
  // (Anedot retries webhooks on 5xx).
  externalId: string;
  provider: "anedot" | "manual";
  // Full webhook payload, kept in JSONB for future extensibility
  // (donor employer, occupation, notes, etc. -- FEC requires we
  // collect employer/occupation for donations over $200, and Anedot
  // ships those fields when the donor supplies them).
  rawPayload?: Record<string, unknown>;
  createdAt: string;             // ISO8601, matches the receipt date
}

// Valid blog post categories. Kept loose at the type level so legacy
// rows with stale category strings don't break reads, but writes
// through the admin form are constrained to BLOG_CATEGORIES (see
// src/lib/blog-categories.ts).
export type BlogCategory =
  | "Lowcountry"
  | "National"
  | "Platform"
  | "Campaign"
  | "Press";

export type BlogStatus = "draft" | "published" | "scheduled";

export interface BlogPost {
  id: string;                   // e.g. "blog:2026-05-13T12:00:00.000Z:a1b2c3"
  slug: string;                 // kebab-case, unique
  title: string;
  subtitle?: string;
  excerpt: string;              // ~150 char card/meta preview
  bodyHtml: string;             // sanitized HTML from TipTap (DOMPurify
                                // applied on save AND render)
  author: string;               // default "Clayton A. Cuteri"
  category?: BlogCategory;
  tags?: string[];
  featuredImage?: string;       // /blog-images/<filename>
  featuredImageAlt?: string;
  status: BlogStatus;
  publishDate?: string;         // ISO; null until published/scheduled
  readingTimeMinutes: number;   // computed at save (~200 wpm)
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
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

      // Donations. First-class columns for filter/sort (email, amount,
      // created_at, external_id for dedupe, provider for future
      // multi-processor support); JSONB `data` holds the full donor
      // record (address, employer, occupation, raw webhook payload).
      // external_id + provider are UNIQUE so Anedot webhook retries
      // don't create duplicate donation rows.
      await client.query(`
        CREATE TABLE IF NOT EXISTS donations (
          id          TEXT PRIMARY KEY,
          external_id TEXT NOT NULL,
          provider    TEXT NOT NULL,
          email       TEXT NOT NULL,
          amount      NUMERIC(12,2) NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
          data        JSONB NOT NULL,
          UNIQUE (provider, external_id)
        );
      `);
      await client.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS external_id TEXT;`);
      await client.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS provider TEXT;`);
      await client.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS email TEXT;`);
      await client.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS amount NUMERIC(12,2);`);
      await client.query(`ALTER TABLE donations ADD COLUMN IF NOT EXISTS data JSONB;`);
      await client.query(
        `CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations (created_at DESC);`,
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS donations_email_idx ON donations (email);`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS donations_provider_ext_uniq ON donations (provider, external_id);`,
      );

      // Blog posts. First-class columns for the fields we filter or
      // sort on (slug, status, category, publish_date); JSONB data
      // holds the rest of the payload (title, subtitle, body_html,
      // tags, etc.) to keep new fields migration-free.
      await client.query(`
        CREATE TABLE IF NOT EXISTS blog_posts (
          id           TEXT PRIMARY KEY,
          slug         TEXT NOT NULL UNIQUE,
          status       TEXT NOT NULL,
          category     TEXT,
          publish_date TIMESTAMPTZ,
          created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
          data         JSONB NOT NULL
        );
      `);
      await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS slug TEXT;`);
      await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS status TEXT;`);
      await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS category TEXT;`);
      await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS publish_date TIMESTAMPTZ;`);
      await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();`);
      await client.query(`ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS data JSONB;`);
      await client.query(
        `CREATE INDEX IF NOT EXISTS blog_posts_status_idx ON blog_posts (status);`,
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS blog_posts_publish_date_idx ON blog_posts (publish_date DESC);`,
      );
      await client.query(
        `CREATE INDEX IF NOT EXISTS blog_posts_category_idx ON blog_posts (category);`,
      );
      await client.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_uniq ON blog_posts (slug);`,
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
  tagsApplied?: string[],
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
      // On success clear any stale error; on error preserve the new
      // message. Undefined means "leave existing alone."
      convertkitError:
        status === "ok" ? undefined : (error ?? existing.convertkitError),
      // Only overwrite tagsApplied on a successful sync; failed
      // retries shouldn't wipe the previously-recorded good state.
      ...(tagsApplied && status === "ok"
        ? { convertkitTagsApplied: tagsApplied }
        : {}),
    };
    await client.query(
      `UPDATE signups SET data = $2 WHERE id = $1`,
      [id, next],
    );
  });
}

export async function getSignup(id: string): Promise<SignupRecord | null> {
  const res = await withClient((client) =>
    client.query<{ data: SignupRecord }>(
      `SELECT data FROM signups WHERE id = $1`,
      [id],
    ),
  );
  return res.rows[0]?.data ?? null;
}

/**
 * Append a Kit sequence-add attempt to the signup's history log.
 * Used by the admin "Follow up" flow. Kept as an append-only history
 * so we can show "already added on <date>" if an admin re-clicks the
 * same sequence for the same subscriber.
 */
export async function appendSignupSequenceHistory(
  id: string,
  entry: {
    sequenceId: number;
    sequenceName: string;
    status: "ok" | "error";
    error?: string;
  },
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
      convertkitSequenceHistory: [
        ...(existing.convertkitSequenceHistory ?? []),
        {
          ...entry,
          addedAt: new Date().toISOString(),
        },
      ],
    };
    await client.query(`UPDATE signups SET data = $2 WHERE id = $1`, [id, next]);
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

// -------------------------------------------------------------------
// Blog posts
// -------------------------------------------------------------------

export interface BlogPostInput {
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  bodyHtml: string;
  author?: string;
  category?: BlogCategory;
  tags?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  status: BlogStatus;
  publishDate?: string | null;
  readingTimeMinutes: number;
  seoKeywords?: string;
}

function hydrateBlogPost(data: BlogPost): BlogPost {
  // Defensive: tags can land as null from older rows; coerce to undefined
  // so callers don't have to handle both shapes.
  return {
    ...data,
    tags: data.tags && data.tags.length ? data.tags : undefined,
  };
}

export async function putBlogPost(
  input: BlogPostInput,
): Promise<BlogPost> {
  const now = new Date();
  const id = makeKey("blog", now);
  const full: BlogPost = {
    ...input,
    id,
    author: input.author ?? "Clayton A. Cuteri",
    publishDate: input.publishDate ?? undefined,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
  await withClient((client) =>
    client.query(
      `INSERT INTO blog_posts
         (id, slug, status, category, publish_date, created_at, updated_at, data)
       VALUES ($1, $2, $3, $4, $5, $6, $6, $7)`,
      [
        full.id,
        full.slug,
        full.status,
        full.category ?? null,
        full.publishDate ? new Date(full.publishDate) : null,
        now,
        full,
      ],
    ),
  );
  return hydrateBlogPost(full);
}

export async function updateBlogPost(
  id: string,
  patch: Partial<BlogPostInput>,
): Promise<BlogPost | null> {
  return withClient(async (client) => {
    const res = await client.query<{ data: BlogPost }>(
      `SELECT data FROM blog_posts WHERE id = $1`,
      [id],
    );
    if (res.rows.length === 0) return null;
    const existing = res.rows[0].data;
    const now = new Date();
    const next: BlogPost = {
      ...existing,
      ...patch,
      // Preserve immutable + timestamps; updatedAt always bumps.
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: now.toISOString(),
      tags: patch.tags ?? existing.tags,
      // publishDate in the patch input can be string | null | undefined
      // (so callers can explicitly clear it). Coerce null -> undefined
      // on the way out so the BlogPost type stays clean.
      publishDate:
        patch.publishDate === null
          ? undefined
          : (patch.publishDate ?? existing.publishDate),
    };
    await client.query(
      `UPDATE blog_posts
         SET slug = $2,
             status = $3,
             category = $4,
             publish_date = $5,
             updated_at = $6,
             data = $7
       WHERE id = $1`,
      [
        id,
        next.slug,
        next.status,
        next.category ?? null,
        next.publishDate ? new Date(next.publishDate) : null,
        now,
        next,
      ],
    );
    return hydrateBlogPost(next);
  });
}

export async function publishBlogPost(id: string): Promise<BlogPost | null> {
  const now = new Date();
  return updateBlogPost(id, {
    status: "published",
    publishDate: now.toISOString(),
  });
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  return withClient(async (client) => {
    const res = await client.query(`DELETE FROM blog_posts WHERE id = $1`, [id]);
    return (res.rowCount ?? 0) > 0;
  });
}

export async function getBlogPostBySlug(
  slug: string,
  opts?: { includeDrafts?: boolean },
): Promise<BlogPost | null> {
  const conds: string[] = [`slug = $1`];
  const params: unknown[] = [slug];
  if (!opts?.includeDrafts) {
    conds.push(`status = 'published'`);
  }
  const rows = await withClient((client) =>
    client.query<{ data: BlogPost }>(
      `SELECT data FROM blog_posts WHERE ${conds.join(" AND ")} LIMIT 1`,
      params,
    ),
  );
  return rows.rows[0] ? hydrateBlogPost(rows.rows[0].data) : null;
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const rows = await withClient((client) =>
    client.query<{ data: BlogPost }>(
      `SELECT data FROM blog_posts WHERE id = $1 LIMIT 1`,
      [id],
    ),
  );
  return rows.rows[0] ? hydrateBlogPost(rows.rows[0].data) : null;
}

export async function listPublishedPosts(opts?: {
  page?: number;
  pageSize?: number;
  category?: BlogCategory;
}): Promise<{ posts: BlogPost[]; total: number }> {
  const pageSize = Math.max(1, Math.min(50, opts?.pageSize ?? 12));
  const page = Math.max(1, opts?.page ?? 1);
  const offset = (page - 1) * pageSize;

  const conds: string[] = [`status = 'published'`];
  const params: unknown[] = [];
  if (opts?.category) {
    params.push(opts.category);
    conds.push(`category = $${params.length}`);
  }
  const where = `WHERE ${conds.join(" AND ")}`;

  return withClient(async (client) => {
    const [rowsRes, countRes] = await Promise.all([
      client.query<{ data: BlogPost }>(
        `SELECT data FROM blog_posts ${where}
         ORDER BY COALESCE(publish_date, created_at) DESC
         LIMIT ${pageSize} OFFSET ${offset}`,
        params,
      ),
      client.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM blog_posts ${where}`,
        params,
      ),
    ]);
    return {
      posts: rowsRes.rows.map((r) => hydrateBlogPost(r.data)),
      total: Number(countRes.rows[0]?.count ?? 0),
    };
  });
}

export async function listAllPostsAdmin(): Promise<BlogPost[]> {
  const rows = await withClient((client) =>
    client.query<{ data: BlogPost }>(
      `SELECT data FROM blog_posts
       ORDER BY updated_at DESC NULLS LAST, created_at DESC`,
    ),
  );
  return rows.rows.map((r) => hydrateBlogPost(r.data));
}

export async function listRelatedPosts(
  post: BlogPost,
  limit = 3,
): Promise<BlogPost[]> {
  // Same-category, excluding the current post, newest first. Fallback
  // to most-recent-of-anything if not enough in the category.
  return withClient(async (client) => {
    const sameCat = post.category
      ? await client.query<{ data: BlogPost }>(
          `SELECT data FROM blog_posts
           WHERE status = 'published'
             AND id <> $1
             AND category = $2
           ORDER BY COALESCE(publish_date, created_at) DESC
           LIMIT $3`,
          [post.id, post.category, limit],
        )
      : { rows: [] };
    if (sameCat.rows.length >= limit) {
      return sameCat.rows.map((r) => hydrateBlogPost(r.data));
    }
    const remainder = limit - sameCat.rows.length;
    const existingIds = [post.id, ...sameCat.rows.map((r) => r.data.id)];
    const fallback = await client.query<{ data: BlogPost }>(
      `SELECT data FROM blog_posts
       WHERE status = 'published'
         AND id <> ALL($1::text[])
       ORDER BY COALESCE(publish_date, created_at) DESC
       LIMIT $2`,
      [existingIds, remainder],
    );
    return [...sameCat.rows, ...fallback.rows].map((r) => hydrateBlogPost(r.data));
  });
}

export async function listAllPublishedSlugs(): Promise<
  Array<{ slug: string; updatedAt: string; publishDate?: string }>
> {
  const rows = await withClient((client) =>
    client.query<{
      slug: string;
      updated_at: Date;
      publish_date: Date | null;
    }>(
      `SELECT slug, updated_at, publish_date FROM blog_posts WHERE status = 'published'`,
    ),
  );
  return rows.rows.map((r) => ({
    slug: r.slug,
    updatedAt: new Date(r.updated_at).toISOString(),
    publishDate: r.publish_date ? new Date(r.publish_date).toISOString() : undefined,
  }));
}

// -----------------------------------------------------------------------------
// Donations
// -----------------------------------------------------------------------------

/**
 * Insert a donation row. Idempotent on (provider, external_id) via
 * ON CONFLICT DO NOTHING -- Anedot retries webhooks on 5xx, and we
 * don't want a retry to create a duplicate row. Returns the row
 * (existing OR newly created).
 */
export async function upsertDonation(
  record: Omit<DonationRecord, "id" | "createdAt"> & { createdAt?: string },
): Promise<DonationRecord> {
  const now = record.createdAt ? new Date(record.createdAt) : new Date();
  const id = makeKey("donation", now);
  const full: DonationRecord = {
    ...record,
    id,
    createdAt: now.toISOString(),
  };
  await withClient(async (client) => {
    await client.query(
      `INSERT INTO donations (id, external_id, provider, email, amount, created_at, data)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (provider, external_id) DO NOTHING`,
      [full.id, full.externalId, full.provider, full.email, full.amount, now, full],
    );
  });
  // Read back to return whichever row now lives at this (provider, external_id).
  return (await getDonationByExternalId(full.provider, full.externalId)) ?? full;
}

export async function getDonationByExternalId(
  provider: string,
  externalId: string,
): Promise<DonationRecord | null> {
  const rows = await withClient((client) =>
    client.query<{ data: DonationRecord }>(
      `SELECT data FROM donations WHERE provider = $1 AND external_id = $2 LIMIT 1`,
      [provider, externalId],
    ),
  );
  return rows.rows[0]?.data ?? null;
}

export async function listDonations(opts?: {
  since?: Date;
  limit?: number;
}): Promise<DonationRecord[]> {
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
    client.query<{ data: DonationRecord }>(
      `SELECT data FROM donations ${where}
       ORDER BY created_at DESC ${limitClause}`,
      params,
    ),
  );
  return rows.rows.map((r) => r.data);
}

/**
 * Aggregate donation totals + counts for admin KPIs. Kept SQL-side so
 * we never load the full donations table into memory just to sum it.
 */
export async function getDonationTotals(): Promise<{
  totalCents: number;   // sum in cents; render as $ in the UI
  count: number;
  uniqueDonors: number;
  lastAt?: string;
}> {
  return withClient(async (client) => {
    const [totalsRes, uniqueRes, lastRes] = await Promise.all([
      client.query<{ total: string | null; count: string }>(
        `SELECT COALESCE(SUM(amount), 0)::text AS total, COUNT(*)::text AS count FROM donations`,
      ),
      client.query<{ count: string }>(
        `SELECT COUNT(DISTINCT email)::text AS count FROM donations`,
      ),
      client.query<{ last_at: Date | null }>(
        `SELECT MAX(created_at) AS last_at FROM donations`,
      ),
    ]);
    // amount is NUMERIC(12,2); parseFloat + *100 gives cents. Keep
    // integer cents through the wire so JS number precision never
    // rounds a $2,499.99 donation to $2,500.
    const dollars = parseFloat(totalsRes.rows[0]?.total ?? "0");
    return {
      totalCents: Math.round(dollars * 100),
      count: Number(totalsRes.rows[0]?.count ?? 0),
      uniqueDonors: Number(uniqueRes.rows[0]?.count ?? 0),
      lastAt: lastRes.rows[0]?.last_at
        ? new Date(lastRes.rows[0].last_at).toISOString()
        : undefined,
    };
  });
}
