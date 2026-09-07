import { sql } from "drizzle-orm";
import { db } from "../../db/client";
import { auditLog, pulseResponses, rateLimits, submissions } from "../../db/schema";
import { audit } from "./audit";
import { recomputeWeeklyWeights } from "./issues";

/** سياسات الاحتفاظ اليومية — أرقام بالأيام */
export const RETENTION_DAYS = { followUpAnswers: 30, submissionBody: 365, pulseText: 180, auditLog: 730, rateLimits: 8 } as const;

export async function runRetention(): Promise<Record<string, number>> {
  const days = (n: number) => sql`now() - make_interval(days => ${n})`;
  const r1 = await db.update(submissions).set({ answersClean: null }).where(sql`${submissions.answersClean} is not null and ${submissions.createdAt} < ${days(RETENTION_DAYS.followUpAnswers)}`).returning({ id: submissions.id });
  const r2 = await db.update(submissions).set({ bodyClean: null }).where(sql`${submissions.bodyClean} is not null and ${submissions.createdAt} < ${days(RETENTION_DAYS.submissionBody)}`).returning({ id: submissions.id });
  const r3 = await db.update(pulseResponses).set({ oneThingText: null }).where(sql`${pulseResponses.oneThingText} is not null and ${pulseResponses.createdAt} < ${days(RETENTION_DAYS.pulseText)}`).returning({ id: pulseResponses.id });
  const r4 = await db.delete(auditLog).where(sql`${auditLog.at} < ${days(RETENTION_DAYS.auditLog)}`).returning({ id: auditLog.id });
  const r5 = await db.delete(rateLimits).where(sql`${rateLimits.windowStart} < ${days(RETENTION_DAYS.rateLimits)}`).returning({ key: rateLimits.key });
  const issues = await recomputeWeeklyWeights();
  const result = { followUpAnswers: r1.length, submissionBodies: r2.length, pulseTexts: r3.length, auditRows: r4.length, rateRows: r5.length, issuesReweighted: issues };
  await audit({ actorRole: "system", action: "retention.run", entity: "retention", after: result });
  return result;
}
