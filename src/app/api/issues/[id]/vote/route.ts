import type { NextRequest } from "next/server";
import { z } from "zod";
import { AlreadyVoted, voteIssue } from "@/server/issues";
import { deviceHashSchema, handle, json, parseBody, uuidSchema } from "@/server/http";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { id } = await ctx.params;
    if (!uuidSchema.safeParse(id).success) return json({ error: "not_found" }, 404);
    const parsed = await parseBody(req, z.object({ deviceHash: deviceHashSchema }));
    if (!parsed.ok) return parsed.res;
    try {
      return json(await voteIssue(id, parsed.data.deviceHash));
    } catch (error) {
      if (error instanceof AlreadyVoted) return json({ error: "already_voted" }, 409);
      throw error;
    }
  });
}
