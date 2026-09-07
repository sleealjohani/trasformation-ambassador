import type { NextRequest } from "next/server";
import { z } from "zod";
import { publishAnswer } from "@/server/submissions";
import { handle, json, notFound, parseBody, requireAdmin, uuidSchema } from "@/server/http";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "answer.publish");
    if (denied) return denied;
    // المصدر إلزامي — لا إجابة بلا مصدر
    const parsed = await parseBody(req, z.object({ issueId: uuidSchema, answer: z.string().trim().min(5).max(4000), source: z.string().trim().min(2).max(200) }));
    if (!parsed.ok) return parsed.res;
    const result = await publishAnswer(parsed.data);
    return result ? json(result, 201) : notFound();
  });
}
