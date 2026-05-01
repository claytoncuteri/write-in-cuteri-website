// PostHog server-side query helpers  -  SERVER-ONLY.
//
// The admin dashboard asks PostHog for aggregate KPIs that we can't compute
// from Replit DB alone (traffic sources, in-district engaged supporters,
// WAU, name-recognition proxy, funnel completion rates). All calls use the
// POSTHOG_PERSONAL_API_KEY with read-only scopes. That key never leaves the
// server.
//
// We use the HogQL endpoint (/api/projects/<id>/query) because it is the most
// flexible and stable public read path as of the 2025 API surface.

import "server-only";

const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
const POSTHOG_PROJECT_ID = process.env.POSTHOG_PROJECT_ID;
const POSTHOG_PERSONAL_API_KEY = process.env.POSTHOG_PERSONAL_API_KEY;

// PostHog's *ingest* host is different from its *read API* host. The ingest
// host is us.i.posthog.com; the read API is at us.posthog.com. We derive one
// from the other so consumers only have to configure NEXT_PUBLIC_POSTHOG_HOST.
function readApiHost(): string {
  return POSTHOG_HOST.replace("://us.i.posthog.com", "://us.posthog.com").replace(
    "://eu.i.posthog.com",
    "://eu.posthog.com",
  );
}

export function posthogConfigured(): boolean {
  return !!POSTHOG_PROJECT_ID && !!POSTHOG_PERSONAL_API_KEY;
}

interface HogQLResult {
  columns: string[];
  results: unknown[][];
}

async function hogql(query: string): Promise<HogQLResult | null> {
  if (!posthogConfigured()) return null;
  const url = `${readApiHost()}/api/projects/${POSTHOG_PROJECT_ID}/query/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${POSTHOG_PERSONAL_API_KEY}`,
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } }),
    // Admin dashboard reads are cached briefly to avoid hammering PostHog on
    // a page refresh loop. 60 seconds is fresh enough for a KPI dashboard.
    next: { revalidate: 60 },
  });
  if (!res.ok) {
    console.error("[posthog] HogQL query failed", res.status, await res.text());
    return null;
  }
  const data = await res.json();
  return {
    columns: data.columns ?? [],
    results: data.results ?? [],
  };
}

// -----------------------------------------------------------------------------
// Named KPI queries
// -----------------------------------------------------------------------------

/**
 * Distinct visitors over the last 7 days, split between SC-01 IPs and all.
 * SC-01 is approximated via state=SC since county-level geo-IP is
 * unreliable (~60% accuracy on mobile). An admin-side "Geography" tab
 * drills into county/ZIP detail.
 */
export async function wauSplit(): Promise<{ sc: number; total: number }> {
  const data = await hogql(`
    SELECT
      count(DISTINCT if(properties.$geoip_subdivision_1_code = 'SC', person_id, NULL)) AS sc,
      count(DISTINCT person_id) AS total
    FROM events
    WHERE event = '$pageview'
      AND timestamp > now() - INTERVAL 7 DAY
  `);
  if (!data || !data.results[0]) return { sc: 0, total: 0 };
  const [sc, total] = data.results[0];
  return { sc: Number(sc ?? 0), total: Number(total ?? 0) };
}

/**
 * Count of ballot-simulator completions in the last 30 days, filtered to SC
 * residents. Prepends 0 if the event hasn't been captured yet (fresh deploys).
 */
export async function ballotSimCompletionsSc(): Promise<number> {
  const data = await hogql(`
    SELECT count(*)
    FROM events
    WHERE event = 'ballot_sim_completed'
      AND properties.$geoip_subdivision_1_code = 'SC'
      AND timestamp > now() - INTERVAL 30 DAY
  `);
  if (!data || !data.results[0]) return 0;
  return Number(data.results[0][0] ?? 0);
}

/**
 * Count of ballot-simulator STARTS in the last 30 days, SC-filtered.
 * Paired with ballotSimCompletionsSc() to compute the started -> completed
 * funnel rate, the single most useful signal for whether the sim works:
 * <40% completion = the sim is broken; ~70%+ = the sim works.
 */
export async function ballotSimStartsSc(): Promise<number> {
  const data = await hogql(`
    SELECT count(*)
    FROM events
    WHERE event = 'ballot_sim_started'
      AND properties.$geoip_subdivision_1_code = 'SC'
      AND timestamp > now() - INTERVAL 30 DAY
  `);
  if (!data || !data.results[0]) return 0;
  return Number(data.results[0][0] ?? 0);
}

/**
 * All-locations ballot-sim totals (last 30 days), unfiltered by state.
 * Used for two purposes:
 *   1. Out-of-state testing  -  lets the candidate verify the pipeline
 *      works without needing to be physically in SC for the event to
 *      pass the geo-IP filter.
 *   2. Sanity check  -  if SC count is 0 but all-locations is non-zero,
 *      the sim is being used but visitors aren't SC residents (which
 *      would itself be a useful signal: marketing reach is broad but
 *      not converting in-district).
 */
export async function ballotSimTotalsAll(): Promise<{
  starts: number;
  completions: number;
}> {
  const data = await hogql(`
    SELECT
      countIf(event = 'ballot_sim_started') AS starts,
      countIf(event = 'ballot_sim_completed') AS completions
    FROM events
    WHERE event IN ('ballot_sim_started', 'ballot_sim_completed')
      AND timestamp > now() - INTERVAL 30 DAY
  `);
  if (!data || !data.results[0]) return { starts: 0, completions: 0 };
  const [starts, completions] = data.results[0];
  return {
    starts: Number(starts ?? 0),
    completions: Number(completions ?? 0),
  };
}

/**
 * Name-recognition proxy: % of SC sessions whose first referrer is direct or
 * a branded search. Branded search is approximated by hostname containing
 * "cuteri" in the referrer.
 */
export async function nameRecognitionProxy(): Promise<number> {
  const data = await hogql(`
    SELECT
      round(100.0 * countIf(properties.$referrer = '$direct' OR properties.$referrer LIKE '%cuteri%')
            / greatest(count(), 1), 1) AS pct
    FROM events
    WHERE event = '$pageview'
      AND properties.$geoip_subdivision_1_code = 'SC'
      AND timestamp > now() - INTERVAL 30 DAY
  `);
  if (!data || !data.results[0]) return 0;
  return Number(data.results[0][0] ?? 0);
}

/**
 * Returning-visitor rate: of first-time SC visitors in the last 30 days, what
 * share came back at least once within 7 days?
 */
export async function returnRate7d(): Promise<number> {
  const data = await hogql(`
    WITH first_seen AS (
      SELECT person_id, min(timestamp) AS first_ts
      FROM events
      WHERE properties.$geoip_subdivision_1_code = 'SC'
        AND event = '$pageview'
        AND timestamp > now() - INTERVAL 30 DAY
      GROUP BY person_id
    ),
    returned AS (
      SELECT DISTINCT e.person_id
      FROM events e
      JOIN first_seen f ON e.person_id = f.person_id
      WHERE e.timestamp > f.first_ts + INTERVAL 1 HOUR
        AND e.timestamp <= f.first_ts + INTERVAL 7 DAY
    )
    SELECT round(100.0 * (SELECT count() FROM returned) / greatest((SELECT count() FROM first_seen), 1), 1)
  `);
  if (!data || !data.results[0]) return 0;
  return Number(data.results[0][0] ?? 0);
}
