import type { NextRequest } from "next/server";
import { listAllRumors } from "@/server/rumors";
import { handle, json, requireAdmin } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "rumors.read");
    if (denied) return denied;
    return json(await listAllRumors());
  });
}
