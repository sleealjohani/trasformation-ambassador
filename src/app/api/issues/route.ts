import type { NextRequest } from "next/server";
import { listIssues } from "@/server/issues";
import { deviceFromRequest, handle, json } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const device = deviceFromRequest(req);
    const rows = await listIssues({ deviceHash: device ?? undefined, limit: 6 });
    return json(rows.map(({ id, title, topic, topicLabel, weight, status, answerId, voted }) => ({ id, title, topic, topicLabel, weight, status, answerId, voted })));
  });
}
