import type { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { env } from "@/server/env";
import { runRetention } from "@/server/retention";
import { handle, json } from "@/server/http";

export const dynamic = "force-dynamic";

function authorized(req: NextRequest): boolean {
  const secret = env.cronSecret;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return header.length === expected.length && timingSafeEqual(Buffer.from(header), Buffer.from(expected));
}

export async function GET(req: NextRequest) {
  return handle(async () => {
    if (!authorized(req)) return json({ error: "unauthorized" }, 401);
    return json(await runRetention());
  });
}
