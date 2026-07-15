// POST /api/webhooks/anedot
//
// Receives donation_completed webhook events from Anedot and persists
// them into the donations table. Enables the admin donor tracker
// ("who donated, how much, when").
//
// Setup on the Anedot side (do this in Anedot dashboard, one-time):
//   1. Log into Anedot -> Account Settings -> Webhooks
//   2. Add a new webhook. URL: https://writeincuteri.com/api/webhooks/anedot
//   3. Subscribe ONLY to the donation_completed template. Do NOT
//      also subscribe to submission_completed on the same webhook,
//      or Anedot will fire the URL twice per donation (per their
//      docs: "not to subscribe to multiple template types on a
//      single webhook").
//   4. Copy the webhook's Secret Token into Replit Secrets as
//      ANEDOT_WEBHOOK_SECRET.
//   5. Save. Anedot delivers a test event immediately; check
//      Replit logs for a successful [anedot-webhook] entry.
//
// Signature verification: X-Request-Signature header carries the
// hex HMAC-SHA256 of the raw request body using the secret token.
// We compute and timing-safe-compare before touching the DB.
//
// Idempotency: donation.id from the payload becomes external_id.
// upsertDonation ON CONFLICT DO NOTHING dedupes on (provider,
// external_id) so Anedot retries after a 5xx don't produce
// duplicates.

import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { upsertDonation } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SECRET = process.env.ANEDOT_WEBHOOK_SECRET;

function verifySignature(rawBody: string, headerSig: string | null): boolean {
  if (!SECRET || !headerSig) return false;
  const expected = createHmac("sha256", SECRET).update(rawBody).digest("hex");
  try {
    const a = Buffer.from(headerSig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function coerceString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function coerceNumber(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const cleaned = v.replace(/[^0-9.-]/g, "");
    const n = parseFloat(cleaned);
    if (Number.isFinite(n)) return n;
  }
  return 0;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("x-request-signature");
  if (!verifySignature(rawBody, sig)) {
    console.warn("[anedot-webhook] signature verification failed", {
      hasSecret: !!SECRET,
      hasHeader: !!sig,
    });
    // 401 so Anedot marks the delivery as failed and retries (which
    // will succeed once the secret is configured correctly).
    return NextResponse.json({ success: false, error: "Bad signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  // Anedot nests the donation-specific fields under `donation` (id,
  // fees, fund, card info). Everything donor-related sits at the top
  // level of the payload.
  const donation = (payload.donation ?? {}) as Record<string, unknown>;
  const externalId = coerceString(donation.id) ?? coerceString(payload.id);
  if (!externalId) {
    console.error("[anedot-webhook] payload missing donation.id", {
      keys: Object.keys(payload),
    });
    return NextResponse.json(
      { success: false, error: "Missing donation.id" },
      { status: 400 },
    );
  }

  const email = coerceString(payload.email);
  if (!email) {
    console.error("[anedot-webhook] payload missing email", { externalId });
    return NextResponse.json(
      { success: false, error: "Missing donor email" },
      { status: 400 },
    );
  }

  // Prefer amount_in_dollars (already a clean decimal); fall back to
  // event_amount which is sometimes a currency-formatted string like "$50.00".
  const amount = coerceNumber(
    payload.amount_in_dollars ?? payload.event_amount ?? payload.amount,
  );

  const record = await upsertDonation({
    externalId,
    provider: "anedot",
    email,
    firstName: coerceString(payload.first_name),
    lastName: coerceString(payload.last_name),
    phone: coerceString(payload.phone),
    address: [
      coerceString(payload.address_line_1),
      coerceString(payload.address_line_2),
    ]
      .filter(Boolean)
      .join(", "),
    city: coerceString(payload.address_city),
    state: coerceString(payload.address_region),
    zip: coerceString(payload.address_postal_code),
    amount,
    currency: "USD",
    recurring:
      coerceString(payload.frequency) ??
      (payload.recurring ? "recurring" : undefined),
    rawPayload: payload,
    createdAt:
      coerceString(payload.date_iso8601) ??
      coerceString(payload.created_at) ??
      undefined,
  });

  console.log("[anedot-webhook] donation ingested", {
    externalId,
    email,
    amount,
    id: record.id,
  });

  return NextResponse.json({ success: true });
}
