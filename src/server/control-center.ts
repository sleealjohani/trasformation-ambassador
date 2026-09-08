import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { mediaItems } from "../../db/media-schema";
import { auditLog, faqs, issues, journeyStages, knowledgeItems, pulseWeeks, rumors, submissions } from "../../db/schema";
import { audit } from "./audit";
import { listTopics } from "./topics";
import { ts } from "./sql";

const DAY_MS = 86_400_000;
const MEDIA_BUCKET = "bridge-media";
const DEFAULT_PROJECT_REF = "woureabyrnjlgfxcbaea";
const ALLOWED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export class MediaStorageNotConfigured extends Error {
  constructor() {
    super("media_storage_not_configured");
    this.name = "MediaStorageNotConfigured";
  }
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function mediaPublicUrl(path: string): string {
  const ref = process.env.SUPABASE_PROJECT_REF?.trim() || DEFAULT_PROJECT_REF;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  return `https://${ref}.supabase.co/storage/v1/object/public/${MEDIA_BUCKET}/${encoded}`;
}

export async function listPublishedMedia() {
  const rows = await db.select().from(mediaItems).where(eq(mediaItems.published, true)).orderBy(asc(mediaItems.sort), asc(mediaItems.createdAt));
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    sourceLabel: row.sourceLabel,
    sourceUrl: row.sourceUrl,
    mediaUrl: row.mediaUrl,
    storagePath: row.storagePath,
    published: row.published,
    sort: row.sort,
  }));
}

export async function controlCenterSnapshot() {
  const now = new Date();
  const since7 = new Date(now.getTime() - 7 * DAY_MS);
  const since14 = new Date(now.getTime() - 14 * DAY_MS);
  const since30 = new Date(now.getTime() - 30 * DAY_MS);
  const topics = await listTopics();

  const [submissionAgg] = await db
    .select({
      total: sql<number>`count(*) filter (where ${submissions.deletedAt} is null)::int`,
      last7: sql<number>`count(*) filter (where ${submissions.deletedAt} is null and ${submissions.createdAt} >= ${ts(since7)})::int`,
      needsReading: sql<number>`count(*) filter (where ${submissions.deletedAt} is null and ${submissions.needsReading} = true)::int`,
      overdue: sql<number>`count(*) filter (where ${submissions.deletedAt} is null and ${submissions.slaDueAt} < now() and ${submissions.status} not in ('answered','published','out_of_scope','redirected','merged','deleted_by_author'))::int`,
      answered: sql<number>`count(*) filter (where ${submissions.deletedAt} is null and ${submissions.status} in ('answered','published'))::int`,
    })
    .from(submissions);

  const [issueAgg] = await db
    .select({
      total: sql<number>`count(*)::int`,
      open: sql<number>`count(*) filter (where ${issues.status} not in ('answered','closed','published'))::int`,
      review: sql<number>`count(*) filter (where ${issues.needsReview} = true)::int`,
    })
    .from(issues);

  const [rumorAgg] = await db
    .select({ total: sql<number>`count(*)::int`, waiting: sql<number>`count(*) filter (where ${rumors.verdict} = 'waiting')::int` })
    .from(rumors);

  const [faqAgg] = await db
    .select({ total: sql<number>`count(*)::int`, unanswered: sql<number>`count(*) filter (where ${faqs.answer} is null)::int` })
    .from(faqs);

  const [mediaAgg] = await db
    .select({ total: sql<number>`count(*)::int`, published: sql<number>`count(*) filter (where ${mediaItems.published} = true)::int` })
    .from(mediaItems);

  const [pulse] = await db.select().from(pulseWeeks).orderBy(desc(pulseWeeks.week)).limit(1);

  const topicRows = await db
    .select({ key: sql<string>`coalesce(${submissions.topic}, 'other')`, count: sql<number>`count(*)::int` })
    .from(submissions)
    .where(and(isNull(submissions.deletedAt), sql`${submissions.createdAt} >= ${ts(since30)}`))
    .groupBy(sql`coalesce(${submissions.topic}, 'other')`)
    .orderBy(desc(sql`count(*)`));

  const heatRows = await db
    .select({
      day: sql<string>`to_char(timezone('Asia/Riyadh', ${submissions.createdAt}), 'YYYY-MM-DD')`,
      topic: sql<string>`coalesce(${submissions.topic}, 'other')`,
      count: sql<number>`count(*)::int`,
    })
    .from(submissions)
    .where(and(isNull(submissions.deletedAt), sql`${submissions.createdAt} >= ${ts(since7)}`))
    .groupBy(sql`to_char(timezone('Asia/Riyadh', ${submissions.createdAt}), 'YYYY-MM-DD')`, sql`coalesce(${submissions.topic}, 'other')`);

  const trendRows = await db
    .select({
      day: sql<string>`to_char(timezone('Asia/Riyadh', ${submissions.createdAt}), 'YYYY-MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(submissions)
    .where(and(isNull(submissions.deletedAt), sql`${submissions.createdAt} >= ${ts(since14)}`))
    .groupBy(sql`to_char(timezone('Asia/Riyadh', ${submissions.createdAt}), 'YYYY-MM-DD')`)
    .orderBy(asc(sql`to_char(timezone('Asia/Riyadh', ${submissions.createdAt}), 'YYYY-MM-DD')`));

  const faqRows = await db.select().from(faqs).orderBy(desc(faqs.updatedAt), desc(faqs.interestCount));
  const knowledgeRows = await db.select().from(knowledgeItems).orderBy(asc(knowledgeItems.sort), desc(knowledgeItems.updatedAt));
  const journeyRows = await db.select().from(journeyStages).orderBy(asc(journeyStages.sort));
  const mediaRows = await db.select().from(mediaItems).orderBy(asc(mediaItems.sort), desc(mediaItems.updatedAt));
  const auditRows = await db.select().from(auditLog).orderBy(desc(auditLog.at)).limit(40);

  const days = Array.from({ length: 7 }, (_, index) => dayKey(new Date(now.getTime() - (6 - index) * DAY_MS)));
  const topicLabel = (key: string) => topics.find((topic) => topic.slug === key)?.label ?? "أخرى";
  const topTopics = topicRows.slice(0, 8).map((row) => ({ key: row.key, label: topicLabel(row.key), count: row.count }));
  const heatTopics = [...new Set([...topTopics.slice(0, 6).map((row) => row.key), ...heatRows.map((row) => row.topic)])].slice(0, 6);

  return {
    generatedAt: now.toISOString(),
    storageConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()),
    kpis: {
      submissionsTotal: submissionAgg?.total ?? 0,
      submissions7d: submissionAgg?.last7 ?? 0,
      needsReading: submissionAgg?.needsReading ?? 0,
      overdue: submissionAgg?.overdue ?? 0,
      answered: submissionAgg?.answered ?? 0,
      issuesOpen: issueAgg?.open ?? 0,
      issuesReview: issueAgg?.review ?? 0,
      rumorsWaiting: rumorAgg?.waiting ?? 0,
      unansweredFaqs: faqAgg?.unanswered ?? 0,
      publishedMedia: mediaAgg?.published ?? 0,
      clarityIndex: pulse?.published && pulse.clarityIndex ? Number(pulse.clarityIndex) : null,
      claritySample: pulse?.sample ?? 0,
    },
    topTopics,
    heatmap: {
      days,
      topics: heatTopics.map((key) => ({ key, label: topicLabel(key) })),
      cells: heatRows.map((row) => ({ day: row.day, topic: row.topic, count: row.count })),
      max: Math.max(1, ...heatRows.map((row) => row.count)),
    },
    trend: trendRows.map((row) => ({ day: row.day, count: row.count })),
    faqs: faqRows.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      source: row.source,
      topic: row.topic,
      topicLabel: topicLabel(row.topic),
      status: row.status,
      interestCount: row.interestCount,
      updatedAt: row.updatedAt.toISOString(),
    })),
    knowledge: knowledgeRows.map((row) => ({
      id: row.id,
      kind: row.kind,
      title: row.title,
      body: row.body,
      source: row.source,
      sort: row.sort,
      effectiveDate: row.effectiveDate?.toISOString() ?? null,
      updatedAt: row.updatedAt.toISOString(),
    })),
    journey: journeyRows.map((row) => ({
      id: row.id,
      sort: row.sort,
      title: row.title,
      state: row.state,
      whatHappens: row.whatHappens,
      employeeAction: row.employeeAction,
      openQuestions: row.openQuestions,
    })),
    media: mediaRows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      sourceLabel: row.sourceLabel,
      sourceUrl: row.sourceUrl,
      mediaUrl: row.mediaUrl,
      storagePath: row.storagePath,
      published: row.published,
      sort: row.sort,
      updatedAt: row.updatedAt.toISOString(),
    })),
    audit: auditRows.map((row) => ({ id: row.id, action: row.action, entity: row.entity, entityId: row.entityId, at: row.at.toISOString() })),
  };
}

export async function saveFaq(input: { id?: string; question: string; answer?: string | null; source?: string | null; topic: string }) {
  const answer = input.answer?.trim() || null;
  const source = input.source?.trim() || null;
  if (input.id) {
    const [before] = await db.select().from(faqs).where(eq(faqs.id, input.id));
    await db.update(faqs).set({ question: input.question.trim(), answer, source, topic: input.topic, status: answer ? "answered" : "new", updatedAt: new Date() }).where(eq(faqs.id, input.id));
    await audit({ actorRole: "ambassador", action: "content.faq.update", entity: "faq", entityId: input.id, before: before ? { topic: before.topic, status: before.status } : null, after: { topic: input.topic, status: answer ? "answered" : "new" } });
    return;
  }
  const [created] = await db.insert(faqs).values({ question: input.question.trim(), answer, source, topic: input.topic, status: answer ? "answered" : "new" }).returning({ id: faqs.id });
  await audit({ actorRole: "ambassador", action: "content.faq.create", entity: "faq", entityId: created?.id ?? null, after: { topic: input.topic, status: answer ? "answered" : "new" } });
}

export async function importFaqs(rows: Array<{ question: string; answer?: string | null; source?: string | null; topic?: string | null }>) {
  const clean = rows.slice(0, 250).filter((row) => row.question.trim().length > 0);
  if (clean.length === 0) return 0;
  await db.transaction(async (tx) => {
    for (const row of clean) {
      const answer = row.answer?.trim() || null;
      await tx.insert(faqs).values({ question: row.question.trim(), answer, source: row.source?.trim() || null, topic: row.topic?.trim() || "other", status: answer ? "answered" : "new" });
    }
  });
  await audit({ actorRole: "ambassador", action: "content.faq.import", entity: "faq", after: { count: clean.length } });
  return clean.length;
}

export async function saveKnowledge(input: { id?: string; kind: string; title: string; body: string; source: string; sort: number }) {
  if (input.id) {
    await db.update(knowledgeItems).set({ kind: input.kind, title: input.title.trim(), body: input.body.trim(), source: input.source.trim(), sort: input.sort, updatedAt: new Date() }).where(eq(knowledgeItems.id, input.id));
    await audit({ actorRole: "ambassador", action: "content.knowledge.update", entity: "knowledge", entityId: input.id, after: { kind: input.kind, sort: input.sort } });
    return;
  }
  const [created] = await db.insert(knowledgeItems).values({ kind: input.kind, title: input.title.trim(), body: input.body.trim(), source: input.source.trim(), sort: input.sort }).returning({ id: knowledgeItems.id });
  await audit({ actorRole: "ambassador", action: "content.knowledge.create", entity: "knowledge", entityId: created?.id ?? null, after: { kind: input.kind, sort: input.sort } });
}

export async function saveJourney(input: { id?: string; sort: number; title: string; state: string; whatHappens: string; employeeAction: string; openQuestions: string[] }) {
  const values = { sort: input.sort, title: input.title.trim(), state: input.state, whatHappens: input.whatHappens.trim(), employeeAction: input.employeeAction.trim(), openQuestions: input.openQuestions.map((item) => item.trim()).filter(Boolean) };
  if (input.id) {
    await db.update(journeyStages).set(values).where(eq(journeyStages.id, input.id));
    await audit({ actorRole: "ambassador", action: "content.journey.update", entity: "journey", entityId: input.id, after: { state: input.state, sort: input.sort } });
    return;
  }
  const [created] = await db.insert(journeyStages).values(values).returning({ id: journeyStages.id });
  await audit({ actorRole: "ambassador", action: "content.journey.create", entity: "journey", entityId: created?.id ?? null, after: { state: input.state, sort: input.sort } });
}

export async function saveMedia(input: { id?: string; slug?: string | null; title: string; sourceLabel: string; sourceUrl?: string | null; mediaUrl: string; storagePath?: string | null; published: boolean; sort: number }) {
  const values = {
    slug: input.slug?.trim() || `media-${crypto.randomUUID()}`,
    title: input.title.trim(),
    sourceLabel: input.sourceLabel.trim(),
    sourceUrl: input.sourceUrl?.trim() || null,
    mediaUrl: input.mediaUrl.trim(),
    storagePath: input.storagePath?.trim() || null,
    published: input.published,
    sort: input.sort,
    updatedAt: new Date(),
  };
  if (input.id) {
    await db.update(mediaItems).set(values).where(eq(mediaItems.id, input.id));
    await audit({ actorRole: "ambassador", action: "media.update", entity: "media", entityId: input.id, after: { published: input.published, sort: input.sort } });
    return;
  }
  const [created] = await db.insert(mediaItems).values(values).returning({ id: mediaItems.id });
  await audit({ actorRole: "ambassador", action: "media.create", entity: "media", entityId: created?.id ?? null, after: { published: input.published, sort: input.sort } });
}

export async function deleteManaged(entity: "faq" | "knowledge" | "journey" | "media", id: string) {
  if (entity === "faq") await db.delete(faqs).where(eq(faqs.id, id));
  if (entity === "knowledge") await db.delete(knowledgeItems).where(eq(knowledgeItems.id, id));
  if (entity === "journey") await db.delete(journeyStages).where(eq(journeyStages.id, id));
  if (entity === "media") await db.delete(mediaItems).where(eq(mediaItems.id, id));
  await audit({ actorRole: "ambassador", action: `content.${entity}.delete`, entity, entityId: id });
}

export async function createMediaUploadTicket(input: { fileName: string; contentType: string; size: number }) {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!secret) throw new MediaStorageNotConfigured();
  if (!ALLOWED_VIDEO_TYPES.has(input.contentType) || input.size <= 0 || input.size > MAX_VIDEO_BYTES) throw new Error("invalid_media_upload");

  const ref = process.env.SUPABASE_PROJECT_REF?.trim() || DEFAULT_PROJECT_REF;
  const ext = input.contentType === "video/webm" ? "webm" : input.contentType === "video/quicktime" ? "mov" : "mp4";
  const path = `shorts/${dayKey(new Date())}/${crypto.randomUUID()}.${ext}`;
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const base = `https://${ref}.supabase.co/storage/v1`;
  const response = await fetch(`${base}/object/upload/sign/${MEDIA_BUCKET}/${encoded}`, {
    method: "POST",
    headers: { authorization: `Bearer ${secret}`, apikey: secret, "content-type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`media_sign_${response.status}`);
  const payload = (await response.json()) as { url?: string };
  if (!payload.url) throw new Error("media_sign_missing_url");
  const signedUrl = payload.url.startsWith("http") ? payload.url : `${base}${payload.url}`;
  await audit({ actorRole: "ambassador", action: "media.upload.ticket", entity: "media", entityId: path });
  return { signedUrl, publicUrl: mediaPublicUrl(path), storagePath: path };
}
