"use client";

// Campaign manager's cockpit. Every metric ladders to the question
// "are we on track to win SC-01 on Nov 3, 2026?"
//
// Six hero KPIs at top (the ones research showed predict electoral outcome).
// Then tabs for raw lists (volunteer/donor/press/general + quiz), geography,
// and email-list health. Mobile-first because the manager will open this on
// a phone between door-knocks.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  ClipboardList,
  Download,
  LayoutDashboard,
  LogOut,
  Mail,
  MapPin,
  RefreshCw,
  Target,
  Users,
} from "lucide-react";

type Kpis = {
  success: boolean;
  posthogConfigured: boolean;
  signups: {
    total: number;
    byTag: { volunteer: number; donor: number; press: number; general: number };
  };
  quiz: { total: number; withEmail: number; extendedComplete: number };
  wauSc: number;
  wauTotal: number;
  ballotSimCompletionsSc: number;
  ballotSimStartsSc: number;
  ballotSimStartsAll: number;
  ballotSimCompletionsAll: number;
  donations?: {
    totalCents: number;
    count: number;
    uniqueDonors: number;
    lastAt?: string;
  };
  nameRecognitionPct: number;
  returnRate7dPct: number;
  generatedAt: string;
};

type DonationRecord = {
  id: string;
  externalId: string;
  provider: "anedot" | "manual";
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  amount: number;
  currency: string;
  recurring?: string;
  createdAt: string;
};

type KitSequenceOption = {
  id: number;
  name: string;
  active: boolean;
  emailCount: number;
  subscriberCount: number;
};

type SignupRecord = {
  id: string;
  tag: "volunteer" | "donor" | "press" | "general";
  email: string;
  firstName?: string;
  lastName?: string;
  // JSONB `fields` payload. Phone + sms_opt_in + sms_opt_in_at live here
  // so we don't have to add columns every time a new signup surface adds
  // a field. Typed loosely on purpose: the shape is source-dependent.
  fields?: Record<string, string>;
  sourcePage?: string;
  ipRegion?: string;
  ipCity?: string;
  convertkitStatus: "pending" | "ok" | "error";
  convertkitError?: string;
  convertkitTagsApplied?: string[];
  convertkitSequenceHistory?: Array<{
    sequenceId: number;
    sequenceName: string;
    addedAt: string;
    status: "ok" | "error";
    error?: string;
  }>;
  createdAt: string;
};

type Tab = "volunteer" | "donor" | "press" | "general" | "quiz" | "donations";

type PriorityRow = {
  priorityId: string;
  questionId: string;
  heading: string;
  prompt: string;
  yes: number;
  no: number;
  unsure: number;
  answered: number;
  alignedCount: number;
  alignmentPct: number;
};

type Breakdown = {
  success: boolean;
  totalRecords: number;
  rows: PriorityRow[];
};

// Directional targets by month. Shown as small gray text on each hero card.
// Not a commitment  -  adjustable later from a settings page. The shape mirrors
// the research agent's recommended trajectory for a viable write-in.
const TARGETS = {
  engaged: { apr: 2500, jul: 20000, oct: 75000 },
  ballotSim: { apr: 400, jul: 6000, oct: 40000 },
  scSubs: { apr: 1000, jul: 8000, oct: 35000 },
  wauSc: { apr: 500, jul: 4000, oct: 15000 },
  nameRec: { apr: 15, jul: 30, oct: 50 },
  donors: { apr: 50, jul: 400, oct: 2000 },
};

function currentTarget(series: { apr: number; jul: number; oct: number }) {
  const month = new Date().getUTCMonth(); // 0=Jan
  if (month <= 4) return series.apr; // Jan-May -> April target
  if (month <= 8) return series.jul; // Jun-Sep -> July target
  return series.oct; // Oct-Dec -> October target
}

function formatNum(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "k";
  return n.toLocaleString();
}

export function AdminDashboard() {
  const router = useRouter();
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [records, setRecords] = useState<SignupRecord[]>([]);
  const [donations, setDonations] = useState<DonationRecord[]>([]);
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("volunteer");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-row action state so the UI shows spinners on the button that
  // was clicked (not the whole row) and multiple clicks queue harmlessly.
  const [rowBusy, setRowBusy] = useState<Record<string, "retry" | "follow" | null>>({});

  // "Follow up" sequence-picker modal. When followUpFor is non-null,
  // we render a modal offering the loaded sequences list; clicking one
  // POSTs the add-to-sequence request.
  const [followUpFor, setFollowUpFor] = useState<SignupRecord | null>(null);
  const [sequences, setSequences] = useState<KitSequenceOption[]>([]);
  const [sequencesLoading, setSequencesLoading] = useState(false);
  const [sequencesLoaded, setSequencesLoaded] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    // Per-endpoint resilience: a single failing endpoint (e.g. a fresh
    // deploy where /api/admin/quiz-breakdown is still cold, or an empty
    // response body that would blow up r.json()) should NOT take down the
    // whole dashboard. Each fetch is isolated; failures fall back to
    // null and the page renders whatever did succeed.
    const safeJson = async <T,>(url: string): Promise<T | null> => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        const text = await res.text();
        if (!text) return null;
        return JSON.parse(text) as T;
      } catch (err) {
        console.error("[admin] fetch failed", url, err);
        return null;
      }
    };
    try {
      // Route the list fetch based on which tab is active. Donations
      // hit their own endpoint (donations table, different schema);
      // quiz hits the quiz-records list; signup tabs hit the tag
      // filter. Only ONE of the two record buckets is populated on
      // any given refresh -- the tab-render decides which to display.
      const isDonations = activeTab === "donations";
      const listUrl = isDonations
        ? "/api/admin/donations?limit=500"
        : activeTab === "quiz"
          ? "/api/admin/list?resource=quiz&limit=500"
          : `/api/admin/list?tag=${activeTab}&limit=500`;
      const [k, l, b] = await Promise.all([
        safeJson<Kpis>("/api/admin/kpis"),
        safeJson<{
          records?: SignupRecord[] | DonationRecord[];
        }>(listUrl),
        safeJson<Breakdown>("/api/admin/quiz-breakdown"),
      ]);
      if (!k) {
        setError("Failed to load KPIs. Check server logs.");
      } else if (!k.success) {
        setError("Failed to load KPIs.");
      }
      setKpis(k ?? null);
      if (isDonations) {
        setDonations((l?.records as DonationRecord[]) ?? []);
        setRecords([]);
      } else {
        setRecords((l?.records as SignupRecord[]) ?? []);
        setDonations([]);
      }
      setBreakdown(b?.success ? b : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  // ---------------- Row actions ----------------

  /** Retry the Kit sync for a signup whose original sync errored. */
  async function handleRetryKit(record: SignupRecord) {
    setRowBusy((s) => ({ ...s, [record.id]: "retry" }));
    try {
      const res = await fetch(
        `/api/admin/signups/${encodeURIComponent(record.id)}/resend-ck`,
        { method: "POST" },
      );
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        record?: SignupRecord;
      };
      if (!res.ok || !json.success) {
        alert(`Retry failed: ${json.error ?? res.status}`);
      }
      if (json.record) {
        // Merge the updated row into the visible list without a full
        // refetch. Preserves scroll and any other in-flight state.
        setRecords((prev) =>
          prev.map((r) => (r.id === record.id ? (json.record as SignupRecord) : r)),
        );
      }
    } finally {
      setRowBusy((s) => ({ ...s, [record.id]: null }));
    }
  }

  /**
   * Open the follow-up modal for a specific signup. Lazy-loads the
   * Kit sequences list on first open per session; cached thereafter.
   */
  async function openFollowUp(record: SignupRecord) {
    setFollowUpFor(record);
    if (sequencesLoaded) return;
    setSequencesLoading(true);
    try {
      const res = await fetch("/api/admin/kit/sequences", { cache: "no-store" });
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        sequences?: KitSequenceOption[];
      };
      setSequences(json.sequences ?? []);
      setSequencesLoaded(true);
    } finally {
      setSequencesLoading(false);
    }
  }

  /** Add the currently-modal signup to the selected sequence. */
  async function handleAddToSequence(seq: KitSequenceOption) {
    if (!followUpFor) return;
    setRowBusy((s) => ({ ...s, [followUpFor.id]: "follow" }));
    try {
      const res = await fetch(
        `/api/admin/signups/${encodeURIComponent(followUpFor.id)}/add-to-sequence`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sequenceId: seq.id, sequenceName: seq.name }),
        },
      );
      const json = (await res.json().catch(() => ({}))) as {
        success?: boolean;
        error?: string;
        record?: SignupRecord;
      };
      if (!res.ok || !json.success) {
        alert(`Failed to add to sequence: ${json.error ?? res.status}`);
        return;
      }
      if (json.record) {
        setRecords((prev) =>
          prev.map((r) =>
            r.id === followUpFor.id ? (json.record as SignupRecord) : r,
          ),
        );
      }
      setFollowUpFor(null);
    } finally {
      setRowBusy((s) => ({ ...s, [followUpFor.id]: null }));
    }
  }

  // -----------------------------------------------------------------
  // Hero KPI cards
  // -----------------------------------------------------------------
  const heroCards = kpis
    ? [
        {
          label: "In-district engaged",
          value: kpis.signups.total + kpis.quiz.withEmail, // proxy pre-posthog
          target: currentTarget(TARGETS.engaged),
          icon: Target,
          note: "Signups + quiz-email combined. Refines once PostHog captures are flowing.",
        },
        {
          label: "Ballot sim completions (SC, 30d)",
          value: kpis.ballotSimCompletionsSc,
          target: currentTarget(TARGETS.ballotSim),
          icon: CheckCircle2,
          // Two notes packed into the subline:
          //   1. SC funnel rate: started -> completed. The KPI signal.
          //      <40% = sim is broken; ~70%+ = sim works.
          //   2. All-locations totals: lets out-of-state testing show
          //      something on /admin even when geo-IP filters the test
          //      event out of the SC count. Also flags reach-vs-
          //      conversion gaps if all-loc is high but SC is low.
          // Each line is hidden when its denominator is 0 to avoid
          // "0/0" / "NaN%" noise on quiet days.
          note: (() => {
            // Helper: render "<starts> starts -> <pct>% completion"
            // when starts > 0; empty string otherwise. Handles the
            // case where someone completes the sim without the
            // started event firing (e.g. starts < completions due
            // to ingestion timing edge cases) by clamping pct to
            // 100 so we never print "200% completion".
            const fmt = (starts: number, completions: number): string => {
              if (starts <= 0) return "";
              const pct = Math.min(100, Math.round((100 * completions) / starts));
              return `${starts} starts -> ${pct}% completion`;
            };
            const scFmt = fmt(
              kpis.ballotSimStartsSc,
              kpis.ballotSimCompletionsSc,
            );
            const allFmt = fmt(
              kpis.ballotSimStartsAll,
              kpis.ballotSimCompletionsAll,
            );
            const scLine = scFmt ? `SC: ${scFmt}.` : "";
            // Skip the all-locations line if SC is the only source
            // (the numbers would be identical and noisy). Show it
            // otherwise so out-of-state testing still produces a
            // visible % completion line during admin verification.
            const allLine =
              allFmt && kpis.ballotSimStartsAll !== kpis.ballotSimStartsSc
                ? `All locations: ${allFmt}.`
                : "";
            const tagline =
              "Practice = 4-6x higher correct-execution rate on Election Day.";
            return [scLine, allLine, tagline].filter(Boolean).join(" ");
          })(),
        },
        {
          label: "SC-01 subscribers",
          value: kpis.signups.byTag.general + kpis.signups.byTag.volunteer,
          target: currentTarget(TARGETS.scSubs),
          icon: Mail,
          note: "GOTV-addressable universe. Refines with ConvertKit state-field sync.",
        },
        {
          label: "WAU (SC, 7d)",
          value: kpis.wauSc,
          target: currentTarget(TARGETS.wauSc),
          icon: Activity,
          note: kpis.posthogConfigured
            ? "From PostHog. Flat WAU = campaign stalling."
            : "Waiting on PostHog traffic.",
        },
        {
          label: "Name-recognition %",
          value: kpis.nameRecognitionPct,
          target: currentTarget(TARGETS.nameRec),
          icon: Award,
          suffix: "%",
          note: kpis.posthogConfigured
            ? "Direct + branded-search share of SC traffic."
            : "Waiting on PostHog traffic.",
        },
        // Donors card. Once Anedot webhook lands its first donation
        // event, we swap from the interest-signup proxy to real
        // ingested-donation totals + unique-donor count in the note.
        (() => {
          const hasReal = kpis.donations && kpis.donations.count > 0;
          if (hasReal && kpis.donations) {
            const d = kpis.donations;
            const dollars = (d.totalCents / 100).toLocaleString(undefined, {
              style: "currency",
              currency: "USD",
            });
            return {
              label: "Donations",
              value: d.uniqueDonors,
              target: currentTarget(TARGETS.donors),
              icon: Users,
              note: `${d.count} donations totaling ${dollars} from ${d.uniqueDonors} unique donor${d.uniqueDonors === 1 ? "" : "s"}.${
                d.lastAt
                  ? " Last: " + new Date(d.lastAt).toLocaleDateString()
                  : ""
              }`,
            };
          }
          return {
            label: "Donor interest",
            value: kpis.signups.byTag.donor,
            target: currentTarget(TARGETS.donors),
            icon: Users,
            note: "Unique donor-interest signups (pre-webhook). Flips to real Anedot totals once ANEDOT_WEBHOOK_SECRET is set and the first donation completes.",
          };
        })(),
      ]
    : [];

  const tabs: { id: Tab; label: string; icon: typeof Users; count?: number }[] =
    kpis
      ? [
          {
            id: "volunteer",
            label: "Volunteers",
            icon: Users,
            count: kpis.signups.byTag.volunteer,
          },
          {
            id: "donor",
            label: "Donor Interest",
            icon: Award,
            count: kpis.signups.byTag.donor,
          },
          {
            id: "press",
            label: "Press",
            icon: ClipboardList,
            count: kpis.signups.byTag.press,
          },
          {
            id: "general",
            label: "General",
            icon: Mail,
            count: kpis.signups.byTag.general,
          },
          {
            id: "quiz",
            label: "Quiz Results",
            icon: Target,
            count: kpis.quiz.total,
          },
          {
            id: "donations",
            label: "Donations",
            icon: Award,
            count: kpis.donations?.count ?? 0,
          },
        ]
      : [];

  return (
    <div className="min-h-[80vh] bg-cream">
      {/* Header */}
      <div className="bg-navy py-5 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard size={22} className="text-white" />
            <h1 className="text-lg sm:text-xl font-bold text-white font-serif">
              Campaign Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle size={18} className="text-red-accent mt-0.5 shrink-0" />
            <div className="text-sm text-red-accent">{error}</div>
          </div>
        )}

        {/* Quick links to the management surfaces that aren't tabs.
            Blog posts manage their own list view rather than fitting
            into the signup-tag tab pattern below. */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <a
            href="/admin/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy text-white font-semibold text-sm hover:bg-navy-dark transition-colors"
          >
            Manage blog posts
          </a>
        </div>

        {!kpis?.posthogConfigured && kpis && (
          <div className="mb-6 flex items-start gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <AlertCircle size={18} className="text-yellow-700 mt-0.5 shrink-0" />
            <div className="text-sm text-yellow-800">
              <strong>PostHog not yet reporting.</strong> Add
              POSTHOG_PROJECT_ID and POSTHOG_PERSONAL_API_KEY to Replit Secrets
              and redeploy  -  WAU, ballot-sim completions, and name-recognition
              metrics will populate within 60 seconds of first site traffic.
            </div>
          </div>
        )}

        {/* Hero KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {heroCards.map((card) => {
            const pct = card.target
              ? Math.min(100, Math.round((Number(card.value) / card.target) * 100))
              : 0;
            const suffix = "suffix" in card ? card.suffix : "";
            return (
              <div
                key={card.label}
                className="bg-white rounded-lg p-4 sm:p-5 border border-gray-200 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-[11px] sm:text-xs font-semibold text-charcoal/60 uppercase tracking-wider leading-tight">
                    {card.label}
                  </span>
                  <card.icon size={16} className="text-navy shrink-0 ml-2" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-charcoal">
                    {typeof card.value === "number"
                      ? formatNum(card.value)
                      : card.value}
                  </span>
                  {suffix && (
                    <span className="text-base font-semibold text-charcoal/60">
                      {suffix}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-navy"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-charcoal/70 whitespace-nowrap">
                    target {formatNum(card.target)}
                    {suffix}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-charcoal/70 leading-snug">
                  {card.note}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-charcoal/70 mb-6 -mt-4 flex items-center gap-1">
          <ArrowUpRight size={11} />
          Targets are directional. Adjust as campaign evolves.
        </p>

        {/* Secondary retention strip */}
        {kpis?.posthogConfigured && (
          <div className="grid grid-cols-3 gap-3 mb-8 text-center">
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-[10px] font-semibold text-charcoal/60 uppercase">
                Return rate 7d
              </p>
              <p className="text-xl font-bold text-charcoal">
                {kpis.returnRate7dPct}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-[10px] font-semibold text-charcoal/60 uppercase">
                WAU total
              </p>
              <p className="text-xl font-bold text-charcoal">
                {formatNum(kpis.wauTotal)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <p className="text-[10px] font-semibold text-charcoal/60 uppercase">
                Quiz extended %
              </p>
              <p className="text-xl font-bold text-charcoal">
                {kpis.quiz.withEmail > 0
                  ? Math.round((kpis.quiz.extendedComplete / kpis.quiz.withEmail) * 100)
                  : 0}
                %
              </p>
            </div>
          </div>
        )}

        {/* Priority agreement breakdown  -  per-question alignment rates. */}
        {breakdown && breakdown.rows.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
            <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-charcoal font-serif text-sm">
                Priority agreement breakdown
              </h2>
              <span className="text-[11px] text-charcoal/70">
                {breakdown.totalRecords} quiz records, sorted by % aligned
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-charcoal/60 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      Priority
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-right font-medium">
                      % aligned
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-right font-medium">
                      Yes
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-right font-medium">
                      No
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-right font-medium">
                      Unsure
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-right font-medium">
                      Answered
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {breakdown.rows.map((row) => {
                    // Visual cue so strongest/weakest pop at a glance.
                    const tone =
                      row.alignmentPct >= 70
                        ? "text-green-700"
                        : row.alignmentPct >= 50
                          ? "text-charcoal"
                          : "text-red-accent";
                    return (
                      <tr key={row.questionId} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-2.5">
                          <div className="font-medium text-charcoal">
                            {row.heading}
                          </div>
                          <div className="text-[11px] text-charcoal/70 leading-snug">
                            {row.questionId} · {row.priorityId}
                          </div>
                        </td>
                        <td className={`px-4 sm:px-6 py-2.5 text-right font-bold ${tone}`}>
                          {row.answered > 0 ? `${row.alignmentPct}%` : " - "}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-right text-charcoal/70">
                          {row.yes}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-right text-charcoal/70">
                          {row.no}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-right text-charcoal/70">
                          {row.unsure}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-right text-charcoal/70">
                          {row.answered}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 mb-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-navy text-navy"
                  : "border-transparent text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {typeof tab.count === "number" && (
                <span className="text-[11px] bg-gray-100 text-charcoal/70 px-1.5 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Records table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-bold text-charcoal font-serif text-sm">
              {tabs.find((t) => t.id === activeTab)?.label} (newest first)
            </h2>
            <a
              href={
                // Each tab exports its own resource. Without the
                // donations arm, that tab's CSV would silently hit
                // /api/admin/list?tag=donations, an invalid tag that
                // exports ALL signups instead of donations.
                activeTab === "donations"
                  ? "/api/admin/donations?format=csv"
                  : activeTab === "quiz"
                    ? "/api/admin/list?resource=quiz&format=csv"
                    : `/api/admin/list?tag=${activeTab}&format=csv`
              }
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-navy border border-navy/30 rounded-lg hover:bg-navy/5 transition-colors"
            >
              <Download size={14} />
              CSV
            </a>
          </div>

          <div className="overflow-x-auto">
            {activeTab === "donations" ? (
              donations.length === 0 ? (
                <div className="p-12 text-center text-sm text-charcoal/70">
                  {loading
                    ? "Loading..."
                    : "No donations yet. Set ANEDOT_WEBHOOK_SECRET in Replit Secrets and configure the Anedot webhook to https://writeincuteri.com/api/webhooks/anedot to start ingesting."}
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs text-charcoal/60 uppercase tracking-wider">
                    <tr>
                      <th className="px-4 sm:px-6 py-2.5 text-left font-medium">When</th>
                      <th className="px-4 sm:px-6 py-2.5 text-right font-medium">Amount</th>
                      <th className="px-4 sm:px-6 py-2.5 text-left font-medium">Donor</th>
                      <th className="px-4 sm:px-6 py-2.5 text-left font-medium">Email</th>
                      <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                        <MapPin size={12} className="inline mr-1" />
                        City / State
                      </th>
                      <th className="px-4 sm:px-6 py-2.5 text-left font-medium">Recurring</th>
                      <th className="px-4 sm:px-6 py-2.5 text-left font-medium">Provider</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {donations.map((d) => (
                      <tr key={d.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-2.5 text-charcoal/70 whitespace-nowrap">
                          {new Date(d.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-right font-bold text-charcoal whitespace-nowrap">
                          ${d.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-charcoal">
                          {[d.firstName, d.lastName].filter(Boolean).join(" ") || " - "}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-charcoal" data-ph-mask>
                          {d.email}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-charcoal/70">
                          {[d.city, d.state].filter(Boolean).join(", ") || " - "}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-charcoal/70">
                          {d.recurring ?? "one-time"}
                        </td>
                        <td className="px-4 sm:px-6 py-2.5 text-charcoal/70">
                          {d.provider}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : records.length === 0 ? (
              <div className="p-12 text-center text-sm text-charcoal/70">
                {loading ? "Loading..." : "No records yet."}
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-charcoal/60 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      When
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      Name
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      Phone
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      SMS
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      <MapPin size={12} className="inline mr-1" />
                      Region
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      Source
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      Kit
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-left font-medium">
                      Tags
                    </th>
                    <th className="px-4 sm:px-6 py-2.5 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {records.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-2.5 text-charcoal/70 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-charcoal">
                        {[r.firstName, r.lastName].filter(Boolean).join(" ") ||
                          " - "}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-charcoal" data-ph-mask>
                        {r.email}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-charcoal/70" data-ph-mask>
                        {r.fields?.phone || " - "}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5">
                        {r.fields?.sms_opt_in === "yes" ? (
                          <span className="text-green-600 text-xs font-medium">
                            yes
                          </span>
                        ) : (
                          <span className="text-charcoal/70 text-xs"> - </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-charcoal/70">
                        {[r.ipCity, r.ipRegion].filter(Boolean).join(", ") ||
                          " - "}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-charcoal/70">
                        {r.sourcePage ?? " - "}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5">
                        {r.convertkitStatus === "ok" ? (
                          <span className="text-green-600 text-xs font-medium">
                            ok
                          </span>
                        ) : r.convertkitStatus === "error" ? (
                          <span
                            className="text-red-accent text-xs font-medium"
                            title={r.convertkitError}
                          >
                            err
                          </span>
                        ) : (
                          <span className="text-charcoal/70 text-xs">
                            <ArrowDownRight size={12} className="inline" />
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5">
                        {r.convertkitTagsApplied && r.convertkitTagsApplied.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[220px]">
                            {r.convertkitTagsApplied.map((t) => (
                              <span
                                key={t}
                                className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-navy/10 text-navy font-medium whitespace-nowrap"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-charcoal/50 text-xs"> - </span>
                        )}
                        {r.convertkitSequenceHistory && r.convertkitSequenceHistory.length > 0 && (
                          <div className="mt-1 text-[10px] text-charcoal/60" title={r.convertkitSequenceHistory.map(h => `${h.sequenceName} (${h.status})`).join("\n")}>
                            + {r.convertkitSequenceHistory.length} sequence{r.convertkitSequenceHistory.length === 1 ? "" : "s"}
                          </div>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-2.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {r.convertkitStatus === "error" && (
                            <button
                              type="button"
                              onClick={() => handleRetryKit(r)}
                              disabled={rowBusy[r.id] === "retry"}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-white bg-red-accent hover:bg-red-accent-dark transition-colors disabled:opacity-40"
                              title="Retry the Kit sync for this signup"
                            >
                              {rowBusy[r.id] === "retry" ? "..." : "Retry Kit"}
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => openFollowUp(r)}
                            disabled={rowBusy[r.id] === "follow"}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-navy border border-navy hover:bg-navy hover:text-white transition-colors disabled:opacity-40"
                            title="Add this subscriber to a Kit sequence"
                          >
                            Follow up
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Follow-up sequence-picker modal. Rendered outside the
            table so it overlays cleanly. */}
        {followUpFor && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            role="dialog"
            aria-modal="true"
            onClick={() => setFollowUpFor(null)}
          >
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-charcoal font-serif">
                  Add to Kit sequence
                </h2>
                <p className="text-xs text-charcoal/70 mt-1" data-ph-mask>
                  {followUpFor.email}
                </p>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {sequencesLoading ? (
                  <p className="p-6 text-center text-sm text-charcoal/60">
                    Loading sequences from Kit...
                  </p>
                ) : sequences.length === 0 ? (
                  <div className="p-6 text-sm text-charcoal/70 leading-relaxed">
                    <p className="font-medium text-charcoal">
                      No usable Kit sequences yet.
                    </p>
                    <p className="mt-2">
                      Create a sequence in Kit (Automations &rarr; Sequences)
                      with at least one email, then reopen this dialog.
                      This account currently has no active sequences
                      dedicated to the campaign  -  the existing ones all
                      belong to Traveling to Consciousness.
                    </p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {sequences.map((s) => {
                      const alreadyAdded = followUpFor.convertkitSequenceHistory?.some(
                        (h) => h.sequenceId === s.id && h.status === "ok",
                      );
                      return (
                        <li key={s.id}>
                          <button
                            type="button"
                            onClick={() => handleAddToSequence(s)}
                            disabled={rowBusy[followUpFor.id] === "follow"}
                            className="w-full text-left px-3 py-2.5 hover:bg-navy/5 rounded-lg transition-colors disabled:opacity-40"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-charcoal truncate">
                                  {s.name}
                                </p>
                                <p className="text-[11px] text-charcoal/60 mt-0.5">
                                  {s.emailCount} email{s.emailCount === 1 ? "" : "s"}  ·  {s.subscriberCount} subscriber{s.subscriberCount === 1 ? "" : "s"}
                                </p>
                              </div>
                              {alreadyAdded && (
                                <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded whitespace-nowrap">
                                  already added
                                </span>
                              )}
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
              <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setFollowUpFor(null)}
                  className="text-sm text-charcoal/70 hover:text-charcoal transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {kpis && (
          <p className="mt-6 text-[11px] text-charcoal/70 text-center">
            Generated {new Date(kpis.generatedAt).toLocaleString()}. Data from
            Replit DB + {kpis.posthogConfigured ? "PostHog" : "PostHog (not configured)"}.
          </p>
        )}
      </div>
    </div>
  );
}
