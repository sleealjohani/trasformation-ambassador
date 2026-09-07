import type { NextRequest } from "next/server";
import { z } from "zod";
import { listIssues } from "@/server/issues";
import { createIssue } from "@/server/submissions";
import { handle, json, parseBody, requireAdmin } from "@/server/http";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "issues.read");
    if (denied) return denied;
    return json(await listIssues({ limit: 100, includeReview: true }));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const denied = await requireAdmin(req, "issue.create");
    if (denied) return denied;
    const parsed = await parseBody(req, z.object({ title: z.string().trim().min(5).max(200), topic: z.string().min(1).max(40) }));
    if (!parsed.ok) return parsed.res;
    const created = await createIssue(parsed.data);
    return json(created, 201);
  });
}
