import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";

/** جلسة سفير التغيير: كوكي موقّع بلا حساب مستخدم. */
export const ADMIN_COOKIE = "bridge_admin";
const SESSION_MS = 12 * 3_600_000;

function secret(): Buffer {
  return createHmac("sha256", env.refCodePepper).update(`admin:${env.adminPasscode}`).digest();
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function issueToken(now = Date.now()): string {
  const payload = String(now + SESSION_MS);
  return `${payload}.${sign(payload)}`;
}

export function verifyToken(token: string | undefined, now = Date.now()): boolean {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  return Number(payload) > now;
}

export function passcodeMatches(input: string): boolean {
  const a = Buffer.from(input);
  const b = Buffer.from(env.adminPasscode);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifyToken(store.get(ADMIN_COOKIE)?.value);
}
