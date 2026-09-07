import type { NextRequest } from "next/server";
import { z } from "zod";
import { listPublishedRumors, reportRumor } from "@/server/rumors";
import { deviceHashSchema, handle, json, parseBody } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => json(await listPublishedRumors()));
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const parsed = await parseBody(req, z.object({ claim: z.string().trim().min(5).max(1000), deviceHash: deviceHashSchema }));
    if (!parsed.ok) return parsed.res;
    // لا يعيد أي حالة نشر
    return json(await reportRumor(parsed.data.claim, parsed.data.deviceHash), 201);
  });
}
