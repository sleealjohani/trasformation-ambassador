import type { NextRequest } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE, issueToken, passcodeMatches } from "@/server/admin-session";
import { audit } from "@/server/audit";
import { consumeRate } from "@/server/rate";
import { handle, json, parseBody, rateLimited } from "@/server/http";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const parsed = await parseBody(req, z.object({ passcode: z.string().min(1).max(200), deviceHash: z.string().regex(/^[0-9a-f]{64}$/) }));
    if (!parsed.ok) return parsed.res;
    if (!(await consumeRate("adminLogin", parsed.data.deviceHash))) return rateLimited();
    if (!passcodeMatches(parsed.data.passcode)) {
      await audit({ actorRole: "system", action: "admin.login.failed", entity: "session" });
      return json({ error: "invalid" }, 401);
    }
    await audit({ actorRole: "ambassador", action: "admin.login", entity: "session" });
    const res = json({ ok: true });
    res.cookies.set(ADMIN_COOKIE, issueToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 12 * 3600 });
    return res;
  });
}
