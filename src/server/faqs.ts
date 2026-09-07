import { desc, eq, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { faqs } from "../../db/schema";
import { listTopics } from "./topics";

export type FaqView = {
  id: string;
  question: string;
  answer: string | null;
  source: string | null;
  topic: string;
  topicLabel: string;
  updatedAt: string;
  interestCount: number;
  status: string;
  issueId: string | null;
};

/** الترتيب: المُجاب حديثًا أولًا ثم الأعلى اهتمامًا. السؤال بلا إجابة يبقى ظاهرًا بحالته. */
export async function listFaqs(topic?: string): Promise<FaqView[]> {
  const topics = await listTopics();
  const rows = await db
    .select()
    .from(faqs)
    .where(topic ? eq(faqs.topic, topic) : sql`true`)
    .orderBy(desc(sql`case when ${faqs.answer} is not null then 1 else 0 end`), desc(faqs.updatedAt), desc(faqs.interestCount));
  return rows.map((r) => ({
    id: r.id,
    question: r.question,
    answer: r.answer,
    source: r.source,
    topic: r.topic,
    topicLabel: topics.find((t) => t.slug === r.topic)?.label ?? "أخرى",
    updatedAt: r.updatedAt.toISOString(),
    interestCount: r.interestCount,
    status: r.status,
    issueId: r.issueId,
  }));
}
