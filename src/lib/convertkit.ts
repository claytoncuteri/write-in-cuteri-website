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
    // Step 1: Subscribe via Kit's HTML form endpoint (triggers confirmation email)
    const formResponse = await fetch(
      `https://app.kit.com/forms/${CONVERTKIT_FORM_ID}/subscriptions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_address: email,
          first_name: firstName || undefined,
          fields: {
            ...(lastName ? { last_name: lastName } : {}),
            ...(fields || {}),
          },
        }),
      }
    );

    if (!formResponse.ok && formResponse.status !== 302) {
      return {
        success: false,
        error: `Form submission failed: ${formResponse.status}`,
      };
    }

    // Step 2: Apply tag via v4 API
    // First get the subscriber ID
    const subResponse = await fetch(
      `https://api.kit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`,
      {
        headers: { "X-Kit-Api-Key": CONVERTKIT_API_KEY },
      }
    );

    if (subResponse.ok) {
      const subData = await subResponse.json();
      const subscriberId = subData.subscribers?.[0]?.id;

      if (subscriberId) {
        const tagId = TAGS[tag];
        await fetch(
          `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Kit-Api-Key": CONVERTKIT_API_KEY,
            },
            body: JSON.stringify({}),
          }
        );
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
