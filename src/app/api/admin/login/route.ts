// POST /api/admin/login
//
// Body: { password: string }
// Sets an httpOnly signed cookie on success. Rate-limited by a simple
// in-memory counter to slow brute-force attempts. For production scale we
// would move the counter to Replit DB, but a single-box autoscale deploy
// gives adequate protection for a campaign-sized admin area.

import { NextRequest, NextResponse } from "next/server";
import { checkPassword, setAdminCookie } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Simple sliding-window rate limit per IP. Not durable across deploys, but
// good enough to deter casual password guessing.
const attempts = new Map<string, { count: number; firstAt: number }>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 10;

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function overLimit(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now - entry.firstAt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (overLimit(ip)) {
    return NextResponse.json(
      { success: false, error: "Too many attempts. Try again in 10 minutes." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!password) {
    return NextResponse.json(
      { success: false, error: "Password required" },
      { status: 400 },
    );
  }

  if (!checkPassword(password)) {
    return NextResponse.json(
      { success: false, error: "Incorrect password" },
      { status: 401 },
    );
  }

  await setAdminCookie();
  return NextResponse.json({ success: true });
}
