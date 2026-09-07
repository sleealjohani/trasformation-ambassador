import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { answers, faqs, issueVotes, issues } from "../../db/schema";
import { audit } from "./audit";
import { hashDevice } from "./device";
import { consumeRate } from "./rate";
import { RateLimited } from "./submissions";
import { listTopics } from "./topics";
import { submissions } from "../../db/schema";


export type IssueView = {
  id: string;
  title: string;
  topic: string;
  topicLabel: string;
  weight: number;
  status: string;
  answerId: string | null;
  answer: string | null;
  answerSource: string | null;
  voted: boolean;
  needsReview: boolean;
  slaDueAt: string | null;
  createdAt: string;
};

export async function listIssues(opts: { deviceHash?: string | undefined; limit?: number; includeReview?: boolean } = {}): Promise<IssueView[]> {
  const device = opts.deviceHash ? hashDevice(opts.deviceHash) : null;
  const topics = await listTopics();
  const rows = await db
    .select({
      i: issues,
      answer: answers.answer,
      answerSource: answers.source,
      voted: device ? sql<boolean>`exists(select 1 from issue_votes v where v.issue_id = ${issues.id} and v.device_hash = ${device})` : sql<boolean>`false`,
    })
    .from(issues)
    .leftJoin(answers, eq(answers.id, issues.answerId))
    .where(opts.includeReview ? sql`true` : eq(issues.needsReview, false))
    .orderBy(desc(issues.weight), desc(issues.updatedAt))
    .limit(opts.limit ?? 6);

  return rows.map(({ i, answer, answerSource, voted }) => ({
    id: i.id,
    title: i.title,
    topic: i.topic,
    topicLabel: topics.find((t) => t.slug === i.topic)?.label ?? "أخرى",
    weight: i.weight,
    status: i.status,
    answerId: i.answerId,
    answer,
    answerSource,
    voted: Boolean(voted),
    needsReview: i.needsReview,
    slaDueAt: i.slaDueAt?.toISOString() ?? null,
    createdAt: i.createdAt.toISOString(),
  }));
}

export class AlreadyVoted extends Error {
  constructor() {
    super("already_voted");
  }
}

export async function voteIssue(issueId: string, deviceHash: string): Promise<{ weight: number }> {
  const device = hashDevice(deviceHash);
  const [existing] = await db.select().from(issueVotes).where(and(eq(issueVotes.issueId, issueId), eq(issueVotes.deviceHash, device)));
  if (existing) throw new AlreadyVoted();
  if (!(await consumeRate("vote", device))) throw new RateLimited();

  await db.insert(issueVotes).values({ issueId, deviceHash: device }).onConflictDoNothing();
  const [updated] = await db
    .update(issues)
    .set({ weight: sql`${issues.weight} + 1`, updatedAt: new Date() })
    .where(eq(issues.id, issueId))
    .returning({ weight: issues.weight });
  await db.update(faqs).set({ interestCount: sql`${faqs.interestCount} + 1` }).where(eq(faqs.issueId, issueId));
  if (!updated) throw new Error("issue_not_found");
  return { weight: updated.weight };
}

/** يعيد احتساب الوزن الأسبوعي: أصوات آخر ٧ أيام + مشاركات آخر ٧ أيام */
export async function recomputeWeeklyWeights(): Promise<number> {
  const since = new Date(Date.now() - 7 * 86_400_000);
  const rows = await db.select({ id: issues.id }).from(issues);
  for (const { id } of rows) {
    const [v] = await db.select({ n: sql<number>`count(*)::int` }).from(issueVotes).where(and(eq(issueVotes.issueId, id), gte(issueVotes.createdAt, since)));
    const [s] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(submissions)
      .where(and(eq(submissions.issueId, id), gte(submissions.createdAt, since)));
    const weight = (v?.n ?? 0) + (s?.n ?? 0);
    await db.update(issues).set({ weight }).where(and(eq(issues.id, id), inArray(issues.status, ["open", "referred", "waiting", "answered"])));
  }
  await audit({ actorRole: "system", action: "issue.recompute_weights", entity: "issue" });
  return rows.length;
}
