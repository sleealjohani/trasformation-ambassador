import type { NextRequest } from "next/server";
import { listCardQuestions } from "@/server/submissions";
import { handle, json, requireAdmin } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "card.read");
    if (denied) return denied;
    return json(await listCardQuestions());
  });
}
