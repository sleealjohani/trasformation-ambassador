import type { NextRequest } from "next/server";
import { z } from "zod";
import { CARD_KINDS, CARD_KIND_GATE } from "@/content/card";
import { createSubmission } from "@/server/submissions";
import { deviceHashSchema, handle, json, parseBody } from "@/server/http";

/** صفحة «سؤالك يفتح الحوار» (/q): نوع اختياري ونص — ولا حقل غيرهما. */
const schema = z
  .object({
    kind: z.enum(CARD_KINDS).nullable().optional(),
    body: z.string().trim().min(3).max(4000),
    deviceHash: deviceHashSchema,
  })
  .strict();

export async function POST(req: NextRequest) {
  return handle(async () => {
    const parsed = await parseBody(req, schema);
    if (!parsed.ok) return parsed.res;
    const { kind, body, deviceHash } = parsed.data;
    // التنقية الثانية تجري داخل createSubmission — لا يُخزَّن إلا النص المنقّى
    const result = await createSubmission({ gate: CARD_KIND_GATE[kind ?? "question"], body, deviceHash, channel: "card", cardKind: kind ?? null });
    return json({ refCode: result.refCode }, 201);
  });
}
