import { desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { rumors } from "../../db/schema";
import { mentionsPerson, redact } from "@/lib/redact";
import { SLA_HOURS } from "@/lib/state";
import { jaccard, normalizeArabic, stemSet } from "@/lib/text";
import { audit } from "./audit";
import { hashDevice } from "./device";
import { consumeRate } from "./rate";
import { RateLimited } from "./submissions";

export const RUMOR_VERDICTS = ["waiting", "false", "true", "partly"] as const;
export type RumorVerdict = (typeof RUMOR_VERDICTS)[number];
export const ESCALATION_COUNT = 10;

/** يستقبل الادّعاء، يطبّعه، ويدمجه مع مشابه أو ينشئ جديدًا. لا يعيد أي حالة نشر. */
export async function reportRumor(claim: string, deviceHash: string): Promise<{ received: true }> {
  if (!(await consumeRate("rumor", hashDevice(deviceHash)))) throw new RateLimited();

  const { clean } = redact(claim);
  const claimNorm = normalizeArabic(clean);
  const needsReview = mentionsPerson(claim);
  const set = stemSet(clean);

  const existing = await db.select({ id: rumors.id, claimNorm: rumors.claimNorm, count: rumors.count }).from(rumors);
  let target: { id: string; count: number } | null = null;
  for (const r of existing) {
    if (r.claimNorm === claimNorm || jaccard(set, stemSet(r.claimNorm)) >= 0.6) {
      target = r;
      break;
    }
  }

  if (target) {
    const nextCount = target.count + 1;
    await db
      .update(rumors)
      .set({
        count: nextCount,
        needsReview: sql`${rumors.needsReview} or ${needsReview}`,
        needsEscalation: sql`${rumors.needsEscalation} or ${nextCount >= ESCALATION_COUNT}`,
        updatedAt: new Date(),
      })
      .where(eq(rumors.id, target.id));
  } else {
    await db
      .insert(rumors)
      .values({
        claimNorm,
        claimText: clean,
        count: 1,
        needsReview,
        slaDueAt: new Date(Date.now() + SLA_HOURS.rumorVerdict * 3_600_000),
      })
      .onConflictDoUpdate({ target: rumors.claimNorm, set: { count: sql`${rumors.count} + 1`, updatedAt: new Date() } });
  }

  await audit({ actorRole: "employee", action: "rumor.report", entity: "rumor", after: { merged: Boolean(target), needsReview } });
  return { received: true };
}

export type RumorView = {
  id: string;
  claim: string;
  count: number;
  verdict: RumorVerdict;
  officialText: string | null;
  verdictAt: string | null;
  needsReview: boolean;
  needsEscalation: boolean;
  published: boolean;
  overdue: boolean;
};

function toView(r: typeof rumors.$inferSelect): RumorView {
  return {
    id: r.id,
    claim: r.claimText,
    count: r.count,
    verdict: r.verdict as RumorVerdict,
    officialText: r.officialText,
    verdictAt: r.verdictAt?.toISOString() ?? null,
    needsReview: r.needsReview,
    needsEscalation: r.needsEscalation,
    published: r.published,
    overdue: r.verdict === "waiting" && r.slaDueAt !== null && r.slaDueAt < new Date(),
  };
}

/** المنشور المعتمد فقط — ما يراه الموظف */
export async function listPublishedRumors(): Promise<RumorView[]> {
  const rows = await db.select().from(rumors).where(eq(rumors.published, true)).orderBy(desc(rumors.count));
  return rows.filter((r) => !r.needsReview).map(toView);
}

export async function listAllRumors(): Promise<RumorView[]> {
  const rows = await db.select().from(rumors).orderBy(desc(rumors.needsEscalation), desc(rumors.count));
  return rows.map(toView);
}

export async function setRumorVerdict(id: string, input: { verdict: RumorVerdict; officialText: string }) {
  const [before] = await db.select().from(rumors).where(eq(rumors.id, id));
  if (!before) return null;
  const now = new Date();
  await db
    .update(rumors)
    .set({
      verdict: input.verdict,
      officialText: input.officialText,
      verdictAt: input.verdict === "waiting" ? null : now,
      published: true,
      needsReview: false,
      needsEscalation: false,
      updatedAt: now,
    })
    .where(eq(rumors.id, id));
  await audit({ actorRole: "ambassador", action: "rumor.verdict", entity: "rumor", entityId: id, before: { verdict: before.verdict }, after: { verdict: input.verdict } });
  return true;
}
