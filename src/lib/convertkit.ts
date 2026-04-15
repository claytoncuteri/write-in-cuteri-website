// ConvertKit (Kit) API v4 integration
// Docs: https://developers.kit.com/v4
//
// Uses form-based subscription so Kit's confirmation/incentive email
// is triggered automatically. Subscribers stay "unconfirmed" until
// they click the link in the confirmation email.

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
  const headers = {
    "Content-Type": "application/json",
    "X-Kit-Api-Key": CONVERTKIT_API_KEY,
  };

  try {
    // Step 1: Subscribe via form (triggers confirmation email)
    const formResponse = await fetch(
      `https://api.kit.com/v4/forms/${CONVERTKIT_FORM_ID}/subscribers`,
      {
        method: "POST",
        headers,
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

    if (!formResponse.ok) {
      const err = await formResponse.text();
      return { success: false, error: `Form subscription failed: ${err}` };
    }

    const formData = await formResponse.json();
    const subscriberId = formData.subscriber?.id;

    // Step 2: Apply tag (so we know which form they came from)
    if (subscriberId) {
      const tagId = TAGS[tag];
      await fetch(
        `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({}),
        }
      );
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
