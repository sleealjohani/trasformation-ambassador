import type { NextRequest } from "next/server";
import { z } from "zod";
import { classifySubmission } from "@/server/submissions";
import { handle, json, notFound, parseBody, requireAdmin, uuidSchema } from "@/server/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const denied = await requireAdmin(req, "submission.classify");
    if (denied) return denied;
    const { id } = await ctx.params;
    if (!uuidSchema.safeParse(id).success) return notFound();
    const parsed = await parseBody(req, z.object({ topic: z.string().min(1).max(40), type: z.enum(["question", "concern", "challenge", "idea"]), urgency: z.number().int().min(1).max(5) }));
    if (!parsed.ok) return parsed.res;
    const ok = await classifySubmission(id, parsed.data);
    return ok ? json({ ok: true }) : notFound();
  });
}
