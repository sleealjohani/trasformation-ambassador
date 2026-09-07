import type { NextRequest } from "next/server";
import { z } from "zod";
import { closeSubmission } from "@/server/submissions";
import { handle, json, notFound, parseBody, requireAdmin, uuidSchema } from "@/server/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const denied = await requireAdmin(req, "submission.close");
    if (denied) return denied;
    const { id } = await ctx.params;
    if (!uuidSchema.safeParse(id).success) return notFound();
    const parsed = await parseBody(req, z.object({ kind: z.enum(["out_of_scope", "redirected", "merged"]), reason: z.string().trim().min(2).max(300) }));
    if (!parsed.ok) return parsed.res;
    const ok = await closeSubmission(id, parsed.data.kind, parsed.data.reason);
    return ok ? json({ ok: true }) : notFound();
  });
}
