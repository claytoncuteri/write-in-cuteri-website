// ConvertKit (Kit) integration  -  SERVER-ONLY.
// Uses Kit's HTML form endpoint to trigger confirmation/incentive emails.
// Subscribers stay "unconfirmed" until they click the confirmation link.
// Tags are applied via the v4 API after form submission.
//
// This module must NEVER be imported by client components  -  it reads secrets
// from process.env that are not prefixed NEXT_PUBLIC_ and would be undefined
// in the browser. The `server-only` import below throws at build time if any
// client component tries to pull it in.

import "server-only";

import { looksLikeSC01 } from "@/lib/sc01-detect";

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

// All campaign tags use the SC01- prefix. These names match the tags
// that ALREADY EXIST in the Kit account (created when ConvertKit went
// live), so name-based lookup attaches to the live tags and their
// existing subscribers  -  no Kit-side rename or migration needed.
// Other ventures sharing the Kit account use their own prefixes.
//
// Tag IDs are NOT hardcoded. Kit's POST /v4/tags is idempotent: it
// returns 200 + the existing tag if the name is taken, or 201 + a
// new tag otherwise. We dynamically resolve names -> IDs on first use
// per server process and cache the result in a module-level Map. This
// means:
//   - Zero manual Kit setup. The first signup that hits each tag
//     creates it.
//   - Renames in Kit don't break us: a renamed tag is still found
//     under whatever name lives here.
//   - Adding a new tag is a one-line code change, no Kit ID lookup.
const TAG_NAMES = {
  // Umbrella  -  every campaign-site signup gets this. New tag;
  // auto-created on first signup.
  all: "SC01-All",
  // Intent / role tags. These four pre-date this module and already
  // hold subscribers in Kit.
  supporter: "SC01-Supporter",
  volunteer: "SC01-Volunteer",
  donorInterest: "SC01-DonorInterest",
  mediaInquiry: "SC01-MediaInquiry",
  // Geo-confirmed: applied only when looksLikeSC01() says yes. New
  // tag; auto-created on first signup.
  sc01Resident: "SC01-Resident",
} as const;

// Map the route-level tag string (volunteer/donor/press/general)
// supplied by /api/subscribe + /api/quiz onto the SC01- prefixed
// intent tag name. Keeps the external API stable while letting the
// underlying tag taxonomy evolve.
const ROUTING_TAG_TO_NAME: Record<SubscriberTag, string> = {
  volunteer: TAG_NAMES.volunteer,
  donor: TAG_NAMES.donorInterest,
  press: TAG_NAMES.mediaInquiry,
  general: TAG_NAMES.supporter,
};

export type SubscriberTag = "volunteer" | "donor" | "press" | "general";

interface SubscribeOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  tag: SubscriberTag;
  fields?: Record<string, string>;
  // Geo signals used to decide whether to also apply SC01-Resident.
  // Both optional; either can fire the tag on its own.
  ipRegion?: string;
  zip?: string;
}

// Custom fields the site's forms write via `fields`. Kit silently
// drops values for fields that don't exist in the account, so we
// auto-provision these on first use, same zero-manual-setup
// philosophy as the tags below. Kit derives the field key from the
// label (lowercased, underscored), so these labels yield exactly the
// keys the forms send.
const REQUIRED_CUSTOM_FIELDS = [
  "last_name",
  "phone",
  "zip_code",
  "sms_opt_in",
  "sms_opt_in_at",
] as const;

// Once-per-process latch. Unlike tags, Kit's custom-field create is
// NOT idempotent (422 on duplicate label), so we list first, then
// create only the missing ones. A 422 race from a concurrent
// container is treated as "already exists" and ignored.
let customFieldsEnsured = false;

async function ensureCustomFields(): Promise<void> {
  if (customFieldsEnsured || !CONVERTKIT_API_KEY) return;
  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": CONVERTKIT_API_KEY,
  };
  try {
    const listRes = await fetch(
      "https://api.kit.com/v4/custom_fields?per_page=500",
      { headers },
    );
    if (!listRes.ok) {
      console.error("[convertkit] custom field list failed", {
        status: listRes.status,
      });
      return; // leave latch unset; retry on next signup
    }
    const listBody = (await listRes.json()) as {
      custom_fields?: { key?: string; label?: string }[];
    };
    const existing = new Set(
      (listBody.custom_fields ?? []).flatMap((f) =>
        [f.key, f.label]
          .filter((v): v is string => typeof v === "string")
          .map((v) => v.toLowerCase()),
      ),
    );
    for (const label of REQUIRED_CUSTOM_FIELDS) {
      if (existing.has(label)) continue;
      const res = await fetch("https://api.kit.com/v4/custom_fields", {
        method: "POST",
        headers,
        body: JSON.stringify({ label }),
      });
      const body = await res.text().catch(() => "");
      console.log("[convertkit] custom field create", {
        label,
        status: res.status,
        ok: res.ok || res.status === 422,
        bodyPreview: body.slice(0, 150),
      });
    }
    customFieldsEnsured = true;
  } catch (err) {
    console.error("[convertkit] ensureCustomFields threw", {
      err: err instanceof Error ? err.message : String(err),
    });
  }
}

// In-process cache for tag-name -> tag-id. Empty on container start;
// fills lazily as signups come in. Kit's create endpoint is idempotent,
// so re-creating an existing tag on a fresh container just returns
// the existing ID  -  no risk of duplicates.
const tagIdCache = new Map<string, number>();

async function getOrCreateTagId(name: string): Promise<number | null> {
  const cached = tagIdCache.get(name);
  if (cached) return cached;
  if (!CONVERTKIT_API_KEY) return null;
  try {
    const res = await fetch("https://api.kit.com/v4/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": CONVERTKIT_API_KEY,
      },
      body: JSON.stringify({ name }),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error("[convertkit] tag upsert failed", {
        name,
        status: res.status,
        body: body.slice(0, 200),
      });
      return null;
    }
    const parsed = JSON.parse(body) as { tag?: { id?: number; name?: string } };
    const id = parsed.tag?.id;
    if (!id) {
      console.error("[convertkit] tag upsert returned no id", { name, body: body.slice(0, 200) });
      return null;
    }
    tagIdCache.set(name, id);
    console.log("[convertkit] tag resolved", {
      name,
      id,
      mode: res.status === 201 ? "created" : "existing",
    });
    return id;
  } catch (err) {
    console.error("[convertkit] tag upsert threw", {
      name,
      err: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

async function applyTagToSubscriber(
  subscriberId: number,
  tagId: number,
  tagName: string,
  email: string,
): Promise<boolean> {
  const res = await fetch(
    `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Kit-Api-Key": CONVERTKIT_API_KEY!,
      },
      body: JSON.stringify({}),
    },
  );
  const body = await res.text().catch(() => "");
  console.log("[convertkit] tag apply", {
    email,
    tag: tagName,
    tagId,
    subscriberId,
    status: res.status,
    ok: res.ok,
    bodyPreview: body.slice(0, 200),
  });
  return res.ok;
}

export async function subscribeToConvertKit({
  email,
  firstName,
  lastName,
  tag,
  fields,
  ipRegion,
  zip,
}: SubscribeOptions): Promise<{
  success: boolean;
  error?: string;
  tagsApplied?: string[];
}> {
  if (!CONVERTKIT_API_KEY || !CONVERTKIT_FORM_ID) {
    return {
      success: false,
      error:
        "ConvertKit is not configured. Set CONVERTKIT_API_KEY and CONVERTKIT_FORM_ID in Replit Secrets.",
    };
  }

  try {
    const kitHeaders = {
      "Content-Type": "application/json",
      "X-Kit-Api-Key": CONVERTKIT_API_KEY,
    };

    // Step 0: Make sure the custom fields the forms write actually
    // exist in the Kit account (no-op after the first signup per
    // process). Must run before Step 1 or Kit drops the values.
    await ensureCustomFields();

    // Step 1: Create (or upsert) the subscriber via v4 /subscribers.
    // Kit dedupes by email_address; resubmitting the same email
    // returns the existing subscriber rather than erroring.
    const createResponse = await fetch("https://api.kit.com/v4/subscribers", {
      method: "POST",
      headers: kitHeaders,
      body: JSON.stringify({
        email_address: email,
        first_name: firstName || undefined,
        state: "active",
        fields: {
          ...(lastName ? { last_name: lastName } : {}),
          ...(fields || {}),
        },
      }),
    });
    const createBody = await createResponse.text().catch(() => "");
    console.log("[convertkit] subscriber create", {
      email,
      status: createResponse.status,
      ok: createResponse.ok,
      bodyPreview: createBody.slice(0, 300),
    });
    if (!createResponse.ok) {
      return {
        success: false,
        error: `Subscriber create failed: ${createResponse.status} - ${createBody.slice(0, 200)}`,
      };
    }
    const createData = JSON.parse(createBody) as {
      subscriber?: { id?: number };
    };
    const subscriberId = createData.subscriber?.id;
    if (!subscriberId) {
      return {
        success: false,
        error: "Subscriber created but no id returned",
      };
    }

    // Step 2: Add the subscriber to the form. Form automations
    // (welcome email, double-opt-in, sequences) trigger from this
    // step  -  Step 1 alone does not fire form hooks.
    const formResponse = await fetch(
      `https://api.kit.com/v4/forms/${CONVERTKIT_FORM_ID}/subscribers/${subscriberId}`,
      { method: "POST", headers: kitHeaders, body: JSON.stringify({}) },
    );
    const formBody = await formResponse.text().catch(() => "");
    console.log("[convertkit] form add", {
      email,
      subscriberId,
      formId: CONVERTKIT_FORM_ID,
      status: formResponse.status,
      ok: formResponse.ok,
      bodyPreview: formBody.slice(0, 200),
    });
    // Form-add failure is non-fatal: subscriber still exists and
    // will be tagged in Step 3. Log and continue.

    // Step 3: Resolve and apply tags. Always SC01-All + the routing
    // tag; conditionally SC01-Resident if geo signal says yes.
    const tagNames: string[] = [TAG_NAMES.all, ROUTING_TAG_TO_NAME[tag]];
    if (looksLikeSC01({ ipRegion, zip })) {
      tagNames.push(TAG_NAMES.sc01Resident);
    }
    // Resolve names to IDs in parallel (each is idempotent on Kit's
    // side, so no risk of ordering issues) then apply them.
    const resolved = await Promise.all(
      tagNames.map(async (name) => ({
        name,
        id: await getOrCreateTagId(name),
      })),
    );
    // Apply each resolved tag. Failures are logged but non-fatal;
    // we don't want a missing tag to break the whole signup flow.
    // Successful tag names are collected and returned so callers can
    // persist them on the signup row (admin visibility + retry
    // verification).
    const tagsApplied: string[] = [];
    for (const { name, id } of resolved) {
      if (!id) {
        console.error("[convertkit] skipping tag (no id)", { name, email });
        continue;
      }
      try {
        const ok = await applyTagToSubscriber(subscriberId, id, name, email);
        if (ok) tagsApplied.push(name);
      } catch (err) {
        console.error("[convertkit] tag apply threw", {
          email,
          tag: name,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { success: true, tagsApplied };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// -----------------------------------------------------------------------------
// Admin follow-up helpers: sequence list + add-to-sequence
// -----------------------------------------------------------------------------

export interface KitSequence {
  id: number;
  name: string;
  active: boolean;
  emailCount: number;
  subscriberCount: number;
}

/**
 * Fetch every sequence in the Kit account. Used by the admin
 * "Follow up" picker so Clayton can choose which existing sequence
 * to drop a subscriber into. No auth wrapper here -- caller (an
 * admin route) is expected to gate.
 */
export async function listKitSequences(): Promise<KitSequence[]> {
  if (!CONVERTKIT_API_KEY) return [];
  // Paginate through all pages. Kit's default per_page is 10; ask for
  // 100 to cut round-trips. This account has ~30 sequences today.
  const collected: KitSequence[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 20; page++) {
    const url = new URL("https://api.kit.com/v4/sequences");
    url.searchParams.set("per_page", "100");
    if (cursor) url.searchParams.set("after", cursor);
    const res = await fetch(url.toString(), {
      headers: { "X-Kit-Api-Key": CONVERTKIT_API_KEY },
    });
    if (!res.ok) {
      console.error("[convertkit] list sequences failed", { status: res.status });
      break;
    }
    const body = (await res.json()) as {
      sequences?: Array<{
        id: number;
        name: string;
        active: boolean;
        email_count?: number;
        subscriber_count?: number;
      }>;
      pagination?: { has_next_page: boolean; end_cursor?: string };
    };
    for (const s of body.sequences ?? []) {
      collected.push({
        id: s.id,
        name: s.name,
        active: s.active,
        emailCount: s.email_count ?? 0,
        subscriberCount: s.subscriber_count ?? 0,
      });
    }
    if (!body.pagination?.has_next_page || !body.pagination.end_cursor) break;
    cursor = body.pagination.end_cursor;
  }
  return collected;
}

/**
 * Add a subscriber (by email) to a Kit sequence. Returns success +
 * optional error. Kit dedupes -- adding the same subscriber to the
 * same sequence a second time is a no-op on their side, so admin
 * mis-clicks are safe.
 */
export async function addSubscriberToKitSequence(opts: {
  email: string;
  sequenceId: number;
}): Promise<{ success: boolean; error?: string }> {
  if (!CONVERTKIT_API_KEY) {
    return { success: false, error: "ConvertKit not configured" };
  }
  try {
    const res = await fetch(
      `https://api.kit.com/v4/sequences/${opts.sequenceId}/subscribers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Kit-Api-Key": CONVERTKIT_API_KEY,
        },
        body: JSON.stringify({ email_address: opts.email }),
      },
    );
    const body = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("[convertkit] sequence add failed", {
        email: opts.email,
        sequenceId: opts.sequenceId,
        status: res.status,
        bodyPreview: body.slice(0, 200),
      });
      return {
        success: false,
        error: `Sequence add failed (${res.status}): ${body.slice(0, 200)}`,
      };
    }
    console.log("[convertkit] sequence add ok", {
      email: opts.email,
      sequenceId: opts.sequenceId,
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
