import { asc } from "drizzle-orm";
import { db } from "../../db/client";
import { topics } from "../../db/schema";

export type TopicRow = { slug: string; label: string };

export async function listTopics(): Promise<TopicRow[]> {
  return db.select({ slug: topics.slug, label: topics.label }).from(topics).orderBy(asc(topics.sort));
}

export async function topicLabel(slug: string | null | undefined): Promise<string> {
  if (!slug) return "أخرى";
  const rows = await listTopics();
  return rows.find((t) => t.slug === slug)?.label ?? "أخرى";
}
