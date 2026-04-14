// ConvertKit (Kit) API integration
// Docs: https://developers.kit.com/v4
//
// SETUP:
// 1. Get your API key from Kit dashboard > Settings > Developer
// 2. Create a tag called "Cuteri26-Volunteer" in Kit
// 3. Get the tag ID from Kit dashboard or via API
// 4. Replace the values below

const CONVERTKIT_API_KEY = "[CONVERTKIT_API_KEY]";

// Tag IDs - get these from your Kit dashboard
const TAGS = {
  volunteer: "[CONVERTKIT_TAG_ID_VOLUNTEER]", // Tag: Cuteri26-Volunteer
  donor: "[CONVERTKIT_TAG_ID_DONOR]",         // Tag: Cuteri26-DonorInterest
  press: "[CONVERTKIT_TAG_ID_PRESS]",         // Tag: Cuteri26-Press
  general: "[CONVERTKIT_TAG_ID_GENERAL]",     // Tag: Cuteri26-Supporter
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
  // Skip if not configured
  if (
    CONVERTKIT_API_KEY.startsWith("[") ||
    TAGS[tag].startsWith("[")
  ) {
    console.warn("ConvertKit not configured. Skipping subscription.");
    return { success: false, error: "ConvertKit not configured" };
  }

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
      // Subscriber was created but tagging failed - still partial success
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
