import type { NextRequest } from "next/server";
import { listInbox } from "@/server/submissions";
import { handle, json, requireAdmin } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "inbox.read");
    if (denied) return denied;
    const p = req.nextUrl.searchParams;
    return json(await listInbox({ status: p.get("status") ?? undefined, topic: p.get("topic") ?? undefined }));
  });
}
