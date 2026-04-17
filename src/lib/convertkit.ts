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

const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

// Tag IDs for the Cuteri26 campaign workspace. These are not secrets (they
// appear in public HTML form action URLs) but keeping them here keeps one
// source of truth for routing subscribers to the right automation segment.
const TAGS = {
  volunteer: "18936015", // SC01-Volunteer
  donor: "18936016",     // SC01-DonorInterest
  press: "18936017",     // SC01-MediaInquiry
  general: "18936018",   // SC01-Supporter
} as const;

export type SubscriberTag = keyof typeof TAGS;

interface SubscribeOptions {
  email: string;
  firstName?: string;
  lastName?: string;
  tag: SubscriberTag;
  fields?: Record<string, string>;
}

export async function subscribeToConvertKit({
  email,
  firstName,
  lastName,
  tag,
  fields,
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
    // This returns the subscriber ID we need for form + tag association.
    // Kit dedupes by email_address automatically; resubmitting the same
    // email returns the existing subscriber rather than erroring.
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

    // Step 2: Add the subscriber to the form. Form automations (welcome
    // email, double-opt-in, sequences) trigger from this step  -  simply
    // creating the subscriber in Step 1 does not fire form hooks.
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
    // Form-add failure is non-fatal: subscriber still exists and will be
    // tagged in Step 3. Log and continue.

    // Step 3: Apply the routing tag (volunteer / donor / press / general).
    // Tag-based automations in Kit fan out from here: welcome sequence,
    // segmentation, admin notifications, etc.
    const tagId = TAGS[tag];
    const tagResponse = await fetch(
      `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
      { method: "POST", headers: kitHeaders, body: JSON.stringify({}) },
    );
    const tagBody = await tagResponse.text().catch(() => "");
    console.log("[convertkit] tag apply", {
      email,
      tag,
      tagId,
      subscriberId,
      status: tagResponse.status,
      ok: tagResponse.ok,
      bodyPreview: tagBody.slice(0, 200),
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
