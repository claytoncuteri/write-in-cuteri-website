// ConvertKit (Kit) integration
// Uses Kit's HTML form endpoint to trigger confirmation/incentive emails.
// Subscribers stay "unconfirmed" until they click the confirmation link.
// Tags are applied via the v4 API after form submission.

const CONVERTKIT_API_KEY = "kit_38c5ff1e4ffa6226fa3d1883bdb00d93";
const CONVERTKIT_FORM_ID = "9329221"; // Cuteri for Americans - SC01

const TAGS = {
  volunteer: "18936015",  // SC01-Volunteer
  donor: "18936016",      // SC01-DonorInterest
  press: "18936017",      // SC01-MediaInquiry
  general: "18936018",    // SC01-Supporter
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
      return { success: false, error: `Form submission failed: ${formResponse.status}` };
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
