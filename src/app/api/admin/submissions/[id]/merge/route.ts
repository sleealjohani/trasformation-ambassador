import type { NextRequest } from "next/server";
import { z } from "zod";
import { mergeSubmission } from "@/server/submissions";
import { handle, json, notFound, parseBody, requireAdmin, uuidSchema } from "@/server/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const denied = await requireAdmin(req, "submission.merge");
    if (denied) return denied;
    const { id } = await ctx.params;
    if (!uuidSchema.safeParse(id).success) return notFound();
    const parsed = await parseBody(req, z.object({ issueId: uuidSchema }));
    if (!parsed.ok) return parsed.res;
    const ok = await mergeSubmission(id, parsed.data.issueId);
    return ok ? json({ ok: true }) : notFound();
  });
}
