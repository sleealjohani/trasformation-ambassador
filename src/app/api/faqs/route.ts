import type { NextRequest } from "next/server";
import { listFaqs } from "@/server/faqs";
import { handle, json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => json(await listFaqs(req.nextUrl.searchParams.get("topic") ?? undefined)));
}
