import { and, asc, count, desc, eq, inArray, isNull, ne, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { answers, escalations, faqs, issues, submissionEvents, submissions } from "../../db/schema";
import { getClassifier, type Gate } from "@/lib/classify";
import { findCluster, toClusterKey } from "@/lib/cluster";
import { REDACTION_MARK, redact } from "@/lib/redact";
import { generateRefCode } from "@/lib/refcode";
import { slaDueFor, toVisibleStatus, transition, type SubmissionState, type VisibleStatus } from "@/lib/state";
import { audit } from "./audit";
import { hashDevice, hashRef } from "./device";
import { consumeRate } from "./rate";
import { topicLabel } from "./topics";

export class RateLimited extends Error {
  constructor() {
    super("rate_limited");
  }
}

export type CreateInput = {
  gate: Gate;
  body: string;
  answers?: Record<string, string> | undefined;
  dept?: string | null | undefined;
  deviceHash: string;
};

export type CreateResult = {
  refCode: string;
  topic: string;
  mergedIntoIssueId?: string;
  similarCount: number;
  redactedOnServer: boolean;
};

const MAIN_PATH: SubmissionState[] = ["new", "reviewed", "needs_referral", "referred", "answered", "published"];

/** يمشي على المسار الرئيسي خطوة خطوة حتى الحالة المطلوبة (لا يتجاوز الآلة) */
export function advancePath(from: SubmissionState, to: SubmissionState): SubmissionState[] {
  const i = MAIN_PATH.indexOf(from);
  const j = MAIN_PATH.indexOf(to);
  if (i === -1 || j === -1 || j <= i) return [];
  const steps: SubmissionState[] = [];
  let current = from;
  for (const next of MAIN_PATH.slice(i + 1, j + 1)) {
    current = transition(current, next);
    steps.push(current);
  }
  return steps;
}

async function recordEvent(submissionId: string, state: SubmissionState, note?: string) {
  await db.insert(submissionEvents).values({ submissionId, state, note: note ?? null });
}

function titleFrom(text: string): string {
  const firstSentence = text.split(/[.؟?!\n]/)[0]?.trim() ?? text;
  return firstSentence.length > 90 ? `${firstSentence.slice(0, 87)}…` : firstSentence;
}

export async function createSubmission(input: CreateInput): Promise<CreateResult> {
  const device = hashDevice(input.deviceHash);
  if (!(await consumeRate("submit", device))) throw new RateLimited();

  // التنقية على الخادم مرة ثانية — لا ثقة بما وصل من الجهاز
  const body = redact(input.body);
  const answersClean: Record<string, string> = {};
  for (const [k, v] of Object.entries(input.answers ?? {})) answersClean[k] = redact(v).clean;

  // علامة التنقية تُحذف قبل التصنيف حتى لا تُحسب كلماتها ضمن الموضوع
  const fullText = [body.clean, ...Object.values(answersClean)].join("\n").split(REDACTION_MARK).join(" ");
  const classification = await getClassifier().classify(fullText, input.gate);

  const openIssues = await db
    .select({ id: issues.id, titleNorm: issues.titleNorm })
    .from(issues)
    .where(inArray(issues.status, ["open", "referred", "waiting", "answered"]));
  const cleanForCluster = body.clean.split(REDACTION_MARK).join(" ");
  const match = findCluster(cleanForCluster, openIssues);

  let issueId: string;
  if (match) {
    issueId = match.id;
    await db
      .update(issues)
      .set({ weight: sql`${issues.weight} + 1`, updatedAt: new Date() })
      .where(eq(issues.id, issueId));
  } else {
    const [created] = await db
      .insert(issues)
      .values({
        title: titleFrom(body.clean),
        titleNorm: toClusterKey(cleanForCluster),
        topic: classification.topic ?? "other",
        weight: 1,
        status: "open",
        needsReview: true,
      })
      .returning({ id: issues.id });
    issueId = created?.id ?? "";
  }

  const refCode = generateRefCode();
  const now = new Date();
  const [row] = await db
    .insert(submissions)
    .values({
      refHash: hashRef(refCode),
      gate: input.gate,
      type: classification.type,
      topic: classification.topic,
      bodyClean: body.clean,
      answersClean,
      urgency: classification.urgency,
      sentiment: classification.sentiment,
      confidence: String(classification.confidence),
      needsReading: classification.needsReading,
      status: "new",
      deptOptional: input.dept ?? null,
      issueId: issueId || null,
      deviceHash: device,
      slaDueAt: slaDueFor("new", now),
    })
    .returning({ id: submissions.id });

  if (row) await recordEvent(row.id, "new");

  const [similar] = await db
    .select({ n: count() })
    .from(submissions)
    .where(and(eq(submissions.issueId, issueId), ne(submissions.id, row?.id ?? "")));

  await audit({ actorRole: "employee", action: "submission.create", entity: "submission", entityId: row?.id, after: { gate: input.gate, topic: classification.topic, needsReading: classification.needsReading } });

  return {
    refCode,
    topic: await topicLabel(classification.topic),
    ...(match ? { mergedIntoIssueId: match.id } : {}),
    similarCount: similar?.n ?? 0,
    redactedOnServer: body.hits.length > 0,
  };
}

export type TrackResult = {
  status: VisibleStatus;
  state: SubmissionState;
  topic: string;
  similarCount: number;
  timeline: Array<{ state: VisibleStatus; at: string; note: string | null }>;
  slaDueAt: string | null;
  overdue: boolean;
  deleted: boolean;
};

async function findByCode(code: string) {
  const [row] = await db.select().from(submissions).where(eq(submissions.refHash, hashRef(code)));
  return row ?? null;
}

export async function trackSubmission(code: string, deviceHash: string): Promise<TrackResult | null> {
  if (!(await consumeRate("track", hashDevice(deviceHash)))) throw new RateLimited();
  const row = await findByCode(code);
  if (!row) return null;

  const events = await db
    .select()
    .from(submissionEvents)
    .where(eq(submissionEvents.submissionId, row.id))
    .orderBy(asc(submissionEvents.at));

  const state = row.status as SubmissionState;
  const overdue = row.slaDueAt !== null && row.slaDueAt.getTime() < Date.now() && !["answered", "published"].includes(state);

  const [similar] = row.issueId
    ? await db.select({ n: count() }).from(submissions).where(and(eq(submissions.issueId, row.issueId), ne(submissions.id, row.id)))
    : [{ n: 0 }];

  return {
    status: toVisibleStatus(state, overdue),
    state,
    topic: await topicLabel(row.topic),
    similarCount: similar?.n ?? 0,
    timeline: events.map((e) => ({ state: toVisibleStatus(e.state as SubmissionState), at: e.at.toISOString(), note: e.note })),
    slaDueAt: row.slaDueAt?.toISOString() ?? null,
    overdue,
    deleted: row.deletedAt !== null,
  };
}

/** يحذف النص المنقّى ويبقي الصف للعدّاد المجمّع */
export async function deleteByCode(code: string): Promise<boolean> {
  const row = await findByCode(code);
  if (!row || row.deletedAt) return false;
  await db
    .update(submissions)
    .set({ bodyClean: null, answersClean: null, status: "deleted_by_author", deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(submissions.id, row.id));
  await recordEvent(row.id, "deleted_by_author", "حذف المرسل النص؛ بقي العدّاد فقط");
  await audit({ actorRole: "employee", action: "submission.delete", entity: "submission", entityId: row.id });
  return true;
}

// ===================== إجراءات اللوحة =====================

async function setState(id: string, from: SubmissionState, to: SubmissionState, note?: string) {
  const next = transition(from, to);
  const now = new Date();
  await db.update(submissions).set({ status: next, slaDueAt: slaDueFor(next, now), updatedAt: now }).where(eq(submissions.id, id));
  await recordEvent(id, next, note);
  return next;
}

async function advanceSubmission(id: string, to: SubmissionState, note?: string) {
  const [row] = await db.select({ status: submissions.status }).from(submissions).where(eq(submissions.id, id));
  if (!row) return;
  const from = row.status as SubmissionState;
  if (from === to) return;
  const steps = advancePath(from, to);
  let current = from;
  for (const step of steps) {
    current = await setState(id, current, step, step === to ? note : undefined);
  }
}

export async function classifySubmission(id: string, input: { topic: string; type: string; urgency: number }) {
  const [before] = await db.select().from(submissions).where(eq(submissions.id, id));
  if (!before) return null;
  await db
    .update(submissions)
    .set({ topic: input.topic, type: input.type, urgency: input.urgency, needsReading: false, updatedAt: new Date() })
    .where(eq(submissions.id, id));
  if (before.status === "new") await setState(id, "new", "reviewed", "راجعها سفير التغيير وصنّفها");
  await audit({ actorRole: "ambassador", action: "submission.classify", entity: "submission", entityId: id, before: { topic: before.topic, type: before.type, urgency: before.urgency }, after: input });
  return true;
}

export async function mergeSubmission(id: string, issueId: string) {
  const [row] = await db.select().from(submissions).where(eq(submissions.id, id));
  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId));
  if (!row || !issue) return null;

  await db.update(submissions).set({ issueId, topic: row.topic ?? issue.topic, updatedAt: new Date() }).where(eq(submissions.id, id));
  if (row.issueId !== issueId) {
    await db.update(issues).set({ weight: sql`${issues.weight} + 1`, updatedAt: new Date() }).where(eq(issues.id, issueId));
  }
  // تتبع القضية: إن كانت مُحالة أو مُجابة ترث المشاركة حالتها، وإلا تصبح بحاجة إحالة
  const target: SubmissionState = issue.status === "answered" ? "answered" : issue.status === "referred" ? "referred" : "needs_referral";
  await advanceSubmission(id, target, `دُمجت في قضية: ${issue.title}`);
  await audit({ actorRole: "ambassador", action: "submission.merge", entity: "submission", entityId: id, before: { issueId: row.issueId }, after: { issueId } });
  return true;
}

export async function closeSubmission(id: string, kind: "out_of_scope" | "redirected" | "merged", reason: string) {
  const [row] = await db.select({ status: submissions.status }).from(submissions).where(eq(submissions.id, id));
  if (!row) return null;
  const note =
    kind === "out_of_scope"
      ? `هذا الموضوع خارج نطاق قناة التحول. القناة المناسبة له: ${reason}`
      : kind === "redirected"
        ? `حُوّلت إلى القناة الرسمية: ${reason}`
        : `أُغلقت كتكرار: ${reason}`;
  await db.update(submissions).set({ closeReason: reason, updatedAt: new Date() }).where(eq(submissions.id, id));
  await setState(id, row.status as SubmissionState, kind, note);
  await audit({ actorRole: "ambassador", action: `submission.close.${kind}`, entity: "submission", entityId: id, after: { reason } });
  return true;
}

export async function createIssue(input: { title: string; topic: string }) {
  const [created] = await db
    .insert(issues)
    .values({ title: input.title, titleNorm: toClusterKey(input.title), topic: input.topic, weight: 0, status: "open" })
    .returning();
  await audit({ actorRole: "ambassador", action: "issue.create", entity: "issue", entityId: created?.id, after: input });
  return created ?? null;
}

export async function escalateIssue(issueId: string, input: { toTeam: string; questionText: string }) {
  const [issue] = await db.select().from(issues).where(eq(issues.id, issueId));
  if (!issue) return null;
  const now = new Date();
  const slaDueAt = slaDueFor("referred", now) ?? now;
  await db.insert(escalations).values({ issueId, toTeam: input.toTeam, questionText: redact(input.questionText).clean, slaDueAt });
  await db.update(issues).set({ status: "referred", slaDueAt, needsReview: false, updatedAt: now }).where(eq(issues.id, issueId));

  const rows = await db.select({ id: submissions.id }).from(submissions).where(and(eq(submissions.issueId, issueId), isNull(submissions.deletedAt)));
  for (const r of rows) await advanceSubmission(r.id, "referred", `أُحيلت إلى ${input.toTeam}`);

  await db
    .insert(faqs)
    .values({ question: issue.title, topic: issue.topic, status: "referred", interestCount: issue.weight, issueId })
    .onConflictDoUpdate({ target: faqs.issueId, set: { status: "referred", updatedAt: now } });

  await audit({ actorRole: "ambassador", action: "issue.escalate", entity: "issue", entityId: issueId, after: { toTeam: input.toTeam } });
  return { slaDueAt: slaDueAt.toISOString() };
}

export async function publishAnswer(input: { issueId: string; answer: string; source: string }) {
  const [issue] = await db.select().from(issues).where(eq(issues.id, input.issueId));
  if (!issue) return null;
  const now = new Date();
  const [answer] = await db.insert(answers).values({ issueId: input.issueId, answer: input.answer, source: input.source }).returning({ id: answers.id });
  await db.update(issues).set({ status: "answered", answerId: answer?.id ?? null, slaDueAt: null, updatedAt: now }).where(eq(issues.id, input.issueId));
  await db.update(escalations).set({ closedAt: now, outcome: "answered" }).where(and(eq(escalations.issueId, input.issueId), isNull(escalations.closedAt)));

  await db
    .insert(faqs)
    .values({ question: issue.title, answer: input.answer, source: input.source, topic: issue.topic, status: "published", interestCount: issue.weight, issueId: input.issueId, updatedAt: now })
    .onConflictDoUpdate({ target: faqs.issueId, set: { answer: input.answer, source: input.source, status: "published", updatedAt: now } });

  const rows = await db.select({ id: submissions.id }).from(submissions).where(and(eq(submissions.issueId, input.issueId), isNull(submissions.deletedAt)));
  for (const r of rows) await advanceSubmission(r.id, "answered", "نُشرت الإجابة الرسمية");

  await audit({ actorRole: "ambassador", action: "answer.publish", entity: "issue", entityId: input.issueId, after: { source: input.source } });
  return { answerId: answer?.id ?? null };
}

// ===================== الوارد =====================

export type InboxRow = {
  id: string;
  gate: string;
  type: string;
  topic: string | null;
  bodyClean: string | null;
  answersClean: Record<string, string> | null;
  urgency: number;
  sentiment: string | null;
  confidence: string | null;
  needsReading: boolean;
  status: string;
  issueId: string | null;
  issueTitle: string | null;
  similarCount: number;
  slaDueAt: string | null;
  overdue: boolean;
  createdAt: string;
  score: number;
};

export async function listInbox(filter: { status?: string | undefined; topic?: string | undefined }) {
  const conditions = [isNull(submissions.deletedAt)];
  if (filter.status) conditions.push(eq(submissions.status, filter.status));
  if (filter.topic) conditions.push(eq(submissions.topic, filter.topic));

  const rows = await db
    .select({
      s: submissions,
      issueTitle: issues.title,
      similar: sql<number>`(select count(*)::int from submissions x where x.issue_id = ${submissions.issueId} and x.id <> ${submissions.id})`,
    })
    .from(submissions)
    .leftJoin(issues, eq(issues.id, submissions.issueId))
    .where(and(...conditions))
    .orderBy(desc(submissions.createdAt))
    .limit(200);

  const now = new Date();
  const maxRepeat = rows.reduce((m, r) => Math.max(m, r.similar), 0);
  const { computeUrgencyScore } = await import("@/lib/ranking");

  return rows
    .map<InboxRow>(({ s, issueTitle, similar }) => ({
      id: s.id,
      gate: s.gate,
      type: s.type,
      topic: s.topic,
      bodyClean: s.bodyClean,
      answersClean: s.answersClean,
      urgency: s.urgency,
      sentiment: s.sentiment,
      confidence: s.confidence,
      needsReading: s.needsReading,
      status: s.status,
      issueId: s.issueId,
      issueTitle,
      similarCount: similar,
      slaDueAt: s.slaDueAt?.toISOString() ?? null,
      overdue: s.slaDueAt !== null && s.slaDueAt < now && !["answered", "published", "out_of_scope", "redirected", "merged"].includes(s.status),
      createdAt: s.createdAt.toISOString(),
      score: computeUrgencyScore({ repeat: similar, maxRepeat, createdAt: s.createdAt, now, urgency: s.urgency }),
    }))
    .sort((a, b) => b.score - a.score);
}
