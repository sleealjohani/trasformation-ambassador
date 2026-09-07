import type { NextRequest } from "next/server";
import { z } from "zod";
import { AlreadyAnswered, listPulseWeeks, submitPulse } from "@/server/pulse";
import { deviceHashSchema, handle, json, parseBody } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => json(await listPulseWeeks()));
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const parsed = await parseBody(req, z.object({ clarity: z.number().int().min(1).max(5), oneThing: z.string().max(500).optional(), deviceHash: deviceHashSchema }));
    if (!parsed.ok) return parsed.res;
    try {
      const view = await submitPulse(parsed.data);
      return json({ week: view.week, average: view.clarityIndex ?? undefined, sample: view.sample, published: view.published }, 201);
    } catch (error) {
      if (error instanceof AlreadyAnswered) return json({ error: "already_answered" }, 409);
      throw error;
    }
  });
}
