// POST /api/subscribe
//
// Single endpoint behind every email-capture form on the site. Writes to
// Replit DB FIRST (so we keep the lead even if ConvertKit is down), then
// submits to ConvertKit, then records the result. All PII stays server-side;
// nothing in this route is exposed to the browser bundle.
//
// Body shape:
//   {
//     email: string (required)
//     tag: "volunteer" | "donor" | "press" | "general" (required)
//     firstName?: string
//     lastName?: string
//     fields?: Record<string, string>  // free-form custom fields per form type
//     sourcePage?: string              // e.g. "/get-involved"
//   }

import { NextRequest, NextResponse } from "next/server";
import { subscribeToConvertKit } from "@/lib/convertkit";
import { putSignup, updateSignupStatus, type SignupTag } from "@/lib/db";

// Next.js App Router: force this route to be dynamic (never cached, runs per
// request). Required because we read request headers and write to Replit DB.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const VALID_TAGS = new Set<SignupTag>(["volunteer", "donor", "press", "general"]);

// Basic email regex  -  good enough for client-submitted signup forms. We don't
// try to validate deliverability; ConvertKit will bounce bad addresses.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clientIpHints(req: NextRequest): {
  ipCountry?: string;
  ipRegion?: string;
  ipCity?: string;
} {
  // Replit's edge sets Cloudflare-style geo headers on incoming requests.
  // These are best-effort and the user's device can lie, but they give us
  // enough fidelity for the "is this an SC-01 resident" check in admin KPIs.
  const h = req.headers;
  return {
    ipCountry: h.get("cf-ipcountry") ?? h.get("x-vercel-ip-country") ?? undefined,
    ipRegion: h.get("cf-region-code") ?? h.get("x-vercel-ip-country-region") ?? undefined,
    ipCity: h.get("cf-ipcity") ?? h.get("x-vercel-ip-city") ?? undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const tagRaw = typeof body.tag === "string" ? body.tag : "";
  const firstName = typeof body.firstName === "string" ? body.firstName.trim() : undefined;
  const lastName = typeof body.lastName === "string" ? body.lastName.trim() : undefined;
  const sourcePage = typeof body.sourcePage === "string" ? body.sourcePage : undefined;
  const rawFields = body.fields;
  const fields: Record<string, string> | undefined =
    rawFields && typeof rawFields === "object" && !Array.isArray(rawFields)
      ? Object.fromEntries(
          Object.entries(rawFields as Record<string, unknown>)
            .filter(([, v]) => typeof v === "string" && v.length > 0)
            .map(([k, v]) => [k, String(v).slice(0, 2000)]),
        )
      : undefined;

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json(
      { success: false, error: "Valid email is required" },
      { status: 400 },
    );
  }
  if (!VALID_TAGS.has(tagRaw as SignupTag)) {
    return NextResponse.json(
      { success: false, error: "Invalid tag" },
      { status: 400 },
    );
  }
  const tag = tagRaw as SignupTag;

  const geo = clientIpHints(req);
  const userAgent = req.headers.get("user-agent") ?? undefined;

  // 1. Persist the lead to Replit DB immediately with status=pending. Even if
  // ConvertKit is down, rate-limited, or misconfigured, we still own the
  // email address.
  let record;
  try {
    record = await putSignup({
      tag,
      email,
      firstName,
      lastName,
      fields,
      sourcePage,
      userAgent,
      ipCountry: geo.ipCountry,
      ipRegion: geo.ipRegion,
      ipCity: geo.ipCity,
      convertkitStatus: "pending",
    });
  } catch (err) {
    // If Replit DB write fails (very rare), we still try ConvertKit so the
    // user isn't lost, and we surface an error to admin-side logging.
    console.error("[subscribe] Replit DB write failed", err);
  }

  // 2. Submit to ConvertKit. This triggers the double-opt-in email.
  const ckResult = await subscribeToConvertKit({
    email,
    firstName,
    lastName,
    tag,
    fields,
  });
  if (!ckResult.success) {
    console.error("[subscribe] ConvertKit subscribe failed", {
      email,
      tag,
      error: ckResult.error,
    });
  } else {
    console.log("[subscribe] ConvertKit subscribe ok", { email, tag });
  }

  // 3. Update the Replit DB record with the ConvertKit outcome.
  if (record?.id) {
    await updateSignupStatus(
      record.id,
      ckResult.success ? "ok" : "error",
      ckResult.error,
    );
  }

  // Always return 200 to the client unless the input was malformed  -  we don't
  // want to surface internal errors to end users. Admins see real status via
  // /api/admin/list.
  return NextResponse.json({ success: true });
  } catch (err) {
    // Catch-all so the client's fetch.json() never blows up on an empty body.
    console.error("[subscribe] unexpected error", err);
    return NextResponse.json(
      {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
