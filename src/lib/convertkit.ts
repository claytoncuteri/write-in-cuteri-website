// ConvertKit (Kit) API v4 integration
// Docs: https://developers.kit.com/v4

const CONVERTKIT_API_KEY = "kit_38c5ff1e4ffa6226fa3d1883bdb00d93";

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
    // Step 1: Create or update subscriber
    const subResponse = await fetch("https://api.kit.com/v4/subscribers", {
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
    });

    if (!subResponse.ok) {
      const err = await subResponse.text();
      return { success: false, error: `Subscriber creation failed: ${err}` };
    }

    const subData = await subResponse.json();
    const subscriberId = subData.subscriber?.id;

    if (!subscriberId) {
      return { success: false, error: "No subscriber ID returned" };
    }

    // Step 2: Apply tag
    const tagId = TAGS[tag];
    const tagResponse = await fetch(
      `https://api.kit.com/v4/tags/${tagId}/subscribers/${subscriberId}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      }
    );

    if (!tagResponse.ok) {
      console.warn("Subscriber created but tagging failed");
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
