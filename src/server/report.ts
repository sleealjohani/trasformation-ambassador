import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "../../db/client";
import { auditLog, escalations, pulseWeeks, rumors, submissionEvents, submissions } from "../../db/schema";
import { applyVisibilityThreshold, isoWeek, median } from "@/lib/ranking";
import { toArabicDigits } from "@/lib/numerals";
import { listIssues } from "./issues";
import { listTopics } from "./topics";
import { ts } from "./sql";

export type WeeklyReport = {
  week: string;
  generatedAt: string;
  submissions: { total: number; thisWeek: number; byStatus: Array<{ key: string; count: number }>; byTopic: Array<{ key: string; label: string; count: number }>; byDept: Array<{ key: string; count: number }> };
  responseHours: { median: number | null; sample: number };
  loopClosure: { answered: number; referred: number; ratio: number | null };
  overdue: number;
  topIssues: Array<{ title: string; weight: number; status: string }>;
  rumors: { total: number; waiting: number; false: number; oldestWaitingDays: number | null };
  pulse: { week: string; clarityIndex: number | null; sample: number } | null;
  text: string;
};

/** تقرير مجمّع فقط — بلا نص خام، وبلا تقسيم دون ٧ */
export async function weeklyReport(): Promise<WeeklyReport> {
  const now = new Date();
  const since = new Date(now.getTime() - 7 * 86_400_000);
  const topics = await listTopics();

  const [totals] = await db
    .select({ total: sql<number>`count(*)::int`, thisWeek: sql<number>`count(*) filter (where ${submissions.createdAt} >= ${ts(since)})::int` })
    .from(submissions);

  const byStatusRows = await db.select({ key: submissions.status, count: sql<number>`count(*)::int` }).from(submissions).groupBy(submissions.status);
  const byTopicRows = await db.select({ key: sql<string>`coalesce(${submissions.topic}, 'other')`, count: sql<number>`count(*)::int` }).from(submissions).groupBy(sql`coalesce(${submissions.topic}, 'other')`);
  const byDeptRows = await db
    .select({ key: submissions.deptOptional, count: sql<number>`count(*)::int` })
    .from(submissions)
    .where(sql`${submissions.deptOptional} is not null`)
    .groupBy(submissions.deptOptional);

  // زمن الاستجابة: وسيط الساعات من الإنشاء إلى «تمت الإجابة»
  const answeredEvents = await db
    .select({ hours: sql<number>`extract(epoch from (${submissionEvents.at} - ${submissions.createdAt})) / 3600` })
    .from(submissionEvents)
    .innerJoin(submissions, sql`${submissions.id} = ${submissionEvents.submissionId}`)
    .where(sql`${submissionEvents.state} = 'answered'`);
  const hours = answeredEvents.map((r) => Number(r.hours));

  const [loop] = await db
    .select({
      answered: sql<number>`count(*) filter (where ${submissions.status} in ('answered','published'))::int`,
      referred: sql<number>`count(*) filter (where ${submissions.status} in ('referred','answered','published'))::int`,
    })
    .from(submissions);

  const [overdueRow] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(submissions)
    .where(and(isNull(submissions.deletedAt), sql`${submissions.slaDueAt} < now()`, sql`${submissions.status} not in ('answered','published','out_of_scope','redirected','merged','deleted_by_author')`));

  const [overdueEsc] = await db.select({ n: sql<number>`count(*)::int` }).from(escalations).where(and(isNull(escalations.closedAt), sql`${escalations.slaDueAt} < now()`));

  const issues = await listIssues({ limit: 6 });

  const [rumorAgg] = await db
    .select({
      total: sql<number>`count(*)::int`,
      waiting: sql<number>`count(*) filter (where ${rumors.verdict} = 'waiting')::int`,
      falseCount: sql<number>`count(*) filter (where ${rumors.verdict} = 'false')::int`,
      oldest: sql<string | null>`min(${rumors.createdAt}) filter (where ${rumors.verdict} = 'waiting')`,
    })
    .from(rumors);

  const week = isoWeek(now);
  const lastWeek = isoWeek(since);
  const [pulseRow] = await db.select().from(pulseWeeks).where(eq(pulseWeeks.week, lastWeek));

  const byTopic = byTopicRows.map((r) => ({ key: r.key, label: topics.find((t) => t.slug === r.key)?.label ?? "أخرى", count: r.count })).sort((a, b) => b.count - a.count);
  const byDept = applyVisibilityThreshold(byDeptRows.map((r) => ({ key: r.key ?? "other", count: r.count })));
  const byStatus = byStatusRows.map((r) => ({ key: r.key, count: r.count }));

  const med = median(hours);
  const ratio = (loop?.referred ?? 0) > 0 ? Number(((loop?.answered ?? 0) / (loop?.referred ?? 1)).toFixed(2)) : null;
  const overdue = (overdueRow?.n ?? 0) + (overdueEsc?.n ?? 0);
  const oldestWaitingDays = rumorAgg?.oldest ? Math.floor((now.getTime() - new Date(rumorAgg.oldest).getTime()) / 86_400_000) : null;
  const pulse = pulseRow ? { week: pulseRow.week, clarityIndex: pulseRow.published && pulseRow.clarityIndex ? Number(pulseRow.clarityIndex) : null, sample: pulseRow.sample } : null;

  await db.insert(auditLog).values({ actorRole: "ambassador", action: "report.weekly", entity: "report", entityId: week });

  const n = (value: number) => toArabicDigits(value);
  const lines = [
    `تقرير الأسبوع ${toArabicDigits(week.replace("-W", " · الأسبوع "))} — جسر التحول`,
    `المشاركات: ${n(totals?.total ?? 0)} إجمالًا · ${n(totals?.thisWeek ?? 0)} هذا الأسبوع`,
    `أعلى المواضيع: ${byTopic.slice(0, 3).map((t) => `${t.label} (${n(t.count)})`).join(" · ") || "—"}`,
    `زمن الاستجابة (وسيط): ${med === null ? "لا إجابة مكتملة بعد" : `${n(Math.round(med))} ساعة على ${n(hours.length)} إجابة`}`,
    `إغلاق الحلقة: ${n(loop?.answered ?? 0)} من ${n(loop?.referred ?? 0)} مُحالة${ratio === null ? "" : ` (${n(Math.round(ratio * 100))}٪)`}`,
    `متأخرات SLA: ${n(overdue)}`,
    `القضايا الأعلى: ${issues.map((i) => `${i.title} (${n(i.weight)})`).join(" · ") || "—"}`,
    `الشائعات: ${n(rumorAgg?.total ?? 0)} · بانتظار موقف ${n(rumorAgg?.waiting ?? 0)} · غير صحيحة ${n(rumorAgg?.falseCount ?? 0)}${oldestWaitingDays === null ? "" : ` · أقدم شائعة بلا موقف منذ ${n(oldestWaitingDays)} يومًا`}`,
    `نبض الأسبوع الماضي: ${pulse?.clarityIndex === null || pulse?.clarityIndex === undefined ? "العيّنة غير كافية لإعلان النتيجة" : `${n(pulse.clarityIndex)} من ${n(100)} على ${n(pulse.sample)} ردًا`}`,
    `تقسيم الأقسام: ${byDept.length === 0 ? "لا قسم بلغ عتبة الظهور (٧)" : byDept.map((d) => `${d.key} (${n(d.count)})`).join(" · ")}`,
    "",
    "هذا التقرير مجمّع بالكامل: لا نص خام، ولا معرّف شخص، ولا تقسيم دون سبع مشاركات.",
  ];

  return {
    week,
    generatedAt: now.toISOString(),
    submissions: { total: totals?.total ?? 0, thisWeek: totals?.thisWeek ?? 0, byStatus, byTopic, byDept },
    responseHours: { median: med === null ? null : Number(med.toFixed(1)), sample: hours.length },
    loopClosure: { answered: loop?.answered ?? 0, referred: loop?.referred ?? 0, ratio },
    overdue,
    topIssues: issues.map((i) => ({ title: i.title, weight: i.weight, status: i.status })),
    rumors: { total: rumorAgg?.total ?? 0, waiting: rumorAgg?.waiting ?? 0, false: rumorAgg?.falseCount ?? 0, oldestWaitingDays },
    pulse,
    text: lines.join("\n"),
  };
}

