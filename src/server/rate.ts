import { sql } from "drizzle-orm";
import { db } from "../../db/client";
import { rateLimits } from "../../db/schema";

/** تحديد المعدّل بمعرّف الجهاز لا بالـ IP. الرفض صامت: 429 بلا تفاصيل. */
export const RATE_RULES = {
  submit: { limit: 5, windowMs: 3_600_000 },
  vote: { limit: 6, windowMs: 24 * 3_600_000 },
  track: { limit: 5, windowMs: 3_600_000 },
  rumor: { limit: 5, windowMs: 3_600_000 },
  pulse: { limit: 1, windowMs: 7 * 24 * 3_600_000 },
  adminLogin: { limit: 10, windowMs: 3_600_000 },
} as const;

export type RateBucket = keyof typeof RATE_RULES;

/** يعيد true إن كان الطلب مسموحًا، ويزيد العدّاد ذريًا. */
export async function consumeRate(bucket: RateBucket, deviceHash: string): Promise<boolean> {
  const { limit, windowMs } = RATE_RULES[bucket];
  const key = `${bucket}:${deviceHash}`;
  const now = new Date();
  // نمرّر الأوقات نصًّا بصيغة ISO مع تحويل صريح: postgres-js لا يستنتج نوع الوسيط داخل CASE
  const nowIso = sql`${now.toISOString()}::timestamptz`;
  const cutoff = sql`${new Date(now.getTime() - windowMs).toISOString()}::timestamptz`;
  const expired = sql`${rateLimits.windowStart} < ${cutoff}`;

  const rows = await db
    .insert(rateLimits)
    .values({ key, windowStart: now, count: 1 })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${expired} then ${nowIso} else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });

  const count = rows[0]?.count ?? limit + 1;
  return count <= limit;
}
