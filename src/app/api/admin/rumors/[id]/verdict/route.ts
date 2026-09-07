import type { NextRequest } from "next/server";
import { z } from "zod";
import { RUMOR_VERDICTS, setRumorVerdict } from "@/server/rumors";
import { handle, json, notFound, parseBody, requireAdmin, uuidSchema } from "@/server/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const denied = await requireAdmin(req, "rumor.verdict");
    if (denied) return denied;
    const { id } = await ctx.params;
    if (!uuidSchema.safeParse(id).success) return notFound();
    const parsed = await parseBody(req, z.object({ verdict: z.enum(RUMOR_VERDICTS), officialText: z.string().trim().min(5).max(2000) }));
    if (!parsed.ok) return parsed.res;
    const ok = await setRumorVerdict(id, parsed.data);
    return ok ? json({ ok: true }) : notFound();
  });
}
