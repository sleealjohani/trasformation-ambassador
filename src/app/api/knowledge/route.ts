import type { NextRequest } from "next/server";
import { listKnowledge } from "@/server/knowledge";
import { badRequest, handle, json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const kind = req.nextUrl.searchParams.get("kind") ?? "known";
    if (kind !== "known" && kind !== "unclear" && kind !== "changed") return badRequest("kind");
    return json(await listKnowledge(kind));
  });
}
