import type { NextRequest } from "next/server";
import { z } from "zod";
import { escalateIssue } from "@/server/submissions";
import { handle, json, notFound, parseBody, requireAdmin, uuidSchema } from "@/server/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const denied = await requireAdmin(req, "issue.escalate");
    if (denied) return denied;
    const { id } = await ctx.params;
    if (!uuidSchema.safeParse(id).success) return notFound();
    const parsed = await parseBody(req, z.object({ toTeam: z.string().trim().min(2).max(120), questionText: z.string().trim().min(5).max(2000) }));
    if (!parsed.ok) return parsed.res;
    const result = await escalateIssue(id, parsed.data);
    return result ? json(result) : notFound();
  });
}
