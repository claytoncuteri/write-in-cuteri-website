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

// All Cuteri 2026 campaign tags use the C26- prefix so they cluster
// alphabetically in Kit and a single glance at any subscriber's tag
// list tells you which campaign/site they came from. Other sites
// pulling into the same Kit account presumably use their own prefixes
// (ACP-, CC-, Pod-, etc.).
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
  // Umbrella  -  every Cuteri 2026 site signup gets this.
  all: "C26-All",
  // Intent / role tags (formerly SC01-*; rename in Kit kept the IDs
  // intact, and lookup-by-name finds the renamed tags transparently).
  supporter: "C26-Supporter",
  volunteer: "C26-Volunteer",
  donorInterest: "C26-DonorInterest",
  mediaInquiry: "C26-MediaInquiry",
  // Geo-confirmed: applied only when looksLikeSC01() says yes.
  sc01Resident: "C26-SC01-Resident",
} as const;

// Map the route-level tag string (volunteer/donor/press/general)
// supplied by /api/subscribe + /api/quiz onto the C26- prefixed
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
  // Geo signals used to decide whether to also apply C26-SC01-Resident.
  // Both optional; either can fire the tag on its own.
  ipRegion?: string;
  zip?: string;
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
): Promise<void> {
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
}

export async function subscribeToConvertKit({
  email,
  firstName,
  lastName,
  tag,
  fields,
  ipRegion,
  zip,
}: SubscribeOptions): Promise<{ success: boolean; error?: string }> {
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

    // Step 3: Resolve and apply tags. Always C26-All + the routing
    // tag; conditionally C26-SC01-Resident if geo signal says yes.
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
    for (const { name, id } of resolved) {
      if (!id) {
        console.error("[convertkit] skipping tag (no id)", { name, email });
        continue;
      }
      try {
        await applyTagToSubscriber(subscriberId, id, name, email);
      } catch (err) {
        console.error("[convertkit] tag apply threw", {
          email,
          tag: name,
          err: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
