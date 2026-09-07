import type { NextRequest } from "next/server";
import { z } from "zod";
import { createSubmission } from "@/server/submissions";
import { deviceHashSchema, handle, json, parseBody } from "@/server/http";

const schema = z.object({
  gate: z.enum(["question", "concern", "challenge", "idea"]),
  body: z.string().trim().min(3).max(4000),
  answers: z.record(z.string().max(64), z.string().max(2000)).optional(),
  dept: z.string().max(80).nullable().optional(),
  deviceHash: deviceHashSchema,
});

export async function POST(req: NextRequest) {
  return handle(async () => {
    const parsed = await parseBody(req, schema);
    if (!parsed.ok) return parsed.res;
    const result = await createSubmission(parsed.data);
    return json(result, 201);
  });
}
