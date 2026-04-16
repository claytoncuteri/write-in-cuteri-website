// Admin authentication  -  SERVER-ONLY.
//
// The admin area is gated by a single shared password stored in
// process.env.ADMIN_PASSWORD. On successful login we set a signed, httpOnly
// cookie that carries proof of auth for 7 days. The signature uses HMAC-SHA256
// so a client can't forge a session without the ADMIN_PASSWORD value.
//
// This is deliberately simple  -  the admin area has exactly one user (the
// candidate + campaign manager sharing the same password). For a multi-user
// rollout we would replace this with per-user accounts, but the campaign
// doesn't need that before Nov 3, 2026.

import "server-only";

import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "cuteri_admin";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword(): string | null {
  return process.env.ADMIN_PASSWORD || null;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Build the cookie value. Format: "<issuedAt>.<hmac>"
 * where hmac = HMAC-SHA256(ADMIN_PASSWORD, issuedAt).
 */
function mintCookie(secret: string): string {
  const issuedAt = String(Date.now());
  const signature = sign(issuedAt, secret);
  return `${issuedAt}.${signature}`;
}

function verifyCookie(value: string, secret: string): boolean {
  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature) return false;
  const expected = sign(issuedAt, secret);
  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const ageMs = Date.now() - Number(issuedAt);
  if (!Number.isFinite(ageMs) || ageMs < 0) return false;
  if (ageMs > COOKIE_MAX_AGE_SECONDS * 1000) return false;
  return true;
}

/**
 * Check the request cookie. Returns true if the caller is an authenticated
 * admin, false otherwise. Safe to call from any server context.
 */
export async function isAdminAuthed(): Promise<boolean> {
  const secret = getAdminPassword();
  if (!secret) return false; // no password configured = locked out by default
  const jar = await cookies();
  const raw = jar.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  return verifyCookie(raw, secret);
}

/**
 * Compare the supplied password against ADMIN_PASSWORD. Uses constant-time
 * comparison to foil timing attacks.
 */
export function checkPassword(supplied: string): boolean {
  const secret = getAdminPassword();
  if (!secret) return false;
  const a = Buffer.from(supplied);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Set the signed admin cookie on the outgoing response. Call after a successful
 * password check.
 */
export async function setAdminCookie(): Promise<void> {
  const secret = getAdminPassword();
  if (!secret) return;
  const jar = await cookies();
  jar.set({
    name: COOKIE_NAME,
    value: mintCookie(secret),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

export async function clearAdminCookie(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE_NAME);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
