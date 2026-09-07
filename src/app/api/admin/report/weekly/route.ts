import type { NextRequest } from "next/server";
import { weeklyReport } from "@/server/report";
import { handle, json, requireAdmin } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "report.weekly");
    if (denied) return denied;
    return json(await weeklyReport());
  });
}
