import { asc, eq, isNotNull } from "drizzle-orm";
import { db } from "../../db/client";
import { knowledgeItems } from "../../db/schema";

export type KnowledgeKind = "known" | "unclear" | "changed";

export type KnowledgeCard = {
  id: string;
  kind: KnowledgeKind;
  title: string;
  body: string;
  source: string;
  date: string;
  /** لتبويب «ما الذي تغيّر»: النص السابق */
  previousBody?: string;
};

export async function listKnowledge(kind: KnowledgeKind): Promise<KnowledgeCard[]> {
  if (kind === "changed") {
    // يُبنى تلقائيًا من البطاقات التي لها superseded_by
    const old = await db.select().from(knowledgeItems).where(isNotNull(knowledgeItems.supersededBy)).orderBy(asc(knowledgeItems.sort));
    const cards: KnowledgeCard[] = [];
    for (const o of old) {
      if (!o.supersededBy) continue;
      const [current] = await db.select().from(knowledgeItems).where(eq(knowledgeItems.id, o.supersededBy));
      if (!current) continue;
      cards.push({
        id: current.id,
        kind: "changed",
        title: current.title,
        body: current.body,
        source: current.source,
        date: (current.effectiveDate ?? current.updatedAt).toISOString(),
        previousBody: o.body,
      });
    }
    return cards;
  }

  const rows = await db
    .select()
    .from(knowledgeItems)
    .where(eq(knowledgeItems.kind, kind))
    .orderBy(asc(knowledgeItems.sort));
  return rows
    .filter((r) => r.supersededBy === null)
    .map((r) => ({ id: r.id, kind, title: r.title, body: r.body, source: r.source, date: (r.effectiveDate ?? r.updatedAt).toISOString() }));
}

export async function countUnclear(): Promise<number> {
  const rows = await db.select({ id: knowledgeItems.id }).from(knowledgeItems).where(eq(knowledgeItems.kind, "unclear"));
  return rows.length;
}

