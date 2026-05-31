import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Lightweight signed-cookie session for the single admin user.
 * Pure crypto only (safe to import from proxy.ts and route handlers).
 */
export const ADMIN_COOKIE = "rd_admin";
const TTL_MS = 8 * 60 * 60 * 1000; // 8 hours

function secret(): string {
  return process.env.ADMIN_SESSION_SECRET || "radar-digital-dev-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, "hex");
    const bb = Buffer.from(b, "hex");
    return ba.length === bb.length && timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

/** Token = `<expiryMs>.<hmac(expiryMs)>`. */
export function createSessionToken(ttlMs = TTL_MS): string {
  const exp = Date.now() + ttlMs;
  return `${exp}.${sign(String(exp))}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const [expStr, sig] = token.split(".");
  if (!expStr || !sig) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  return safeEqualHex(sig, sign(expStr));
}

/** Constant-time password check against ADMIN_PASSWORD. */
export function checkAdminPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: Math.floor(TTL_MS / 1000),
};
