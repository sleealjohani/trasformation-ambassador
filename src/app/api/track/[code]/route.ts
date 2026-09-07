import type { NextRequest } from "next/server";
import { isValidRefCode, normalizeRefCode } from "@/lib/refcode";
import { deviceFromRequest, handle, json, notFound } from "@/server/http";
import { deleteByCode, trackSubmission } from "@/server/submissions";

type Ctx = { params: Promise<{ code: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const code = normalizeRefCode((await ctx.params).code);
    const device = deviceFromRequest(req);
    if (!isValidRefCode(code) || !device) return notFound();
    const result = await trackSubmission(code, device);
    return result ? json(result) : notFound();
  });
}

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  return handle(async () => {
    const code = normalizeRefCode((await ctx.params).code);
    if (!isValidRefCode(code)) return notFound();
    const deleted = await deleteByCode(code);
    return deleted ? json({ deleted: true }) : notFound();
  });
}
