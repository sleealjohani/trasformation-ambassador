"use client";

import { useCallback, useState, type ComponentProps } from "react";
import { AdminDashboard } from "./AdminDashboard";
import { AdminContentManager } from "./AdminContentManager";
import { AdminMediaManager } from "./AdminMediaManager";
import { AdminReports } from "./AdminReports";
import { Icon, type IconName } from "@/components/ui/Icon";
import { apiGet, errorMessage } from "@/lib/api";
import type { ControlSnapshot } from "./admin-control-types";

type WorkProps = ComponentProps<typeof AdminDashboard>;
type Tab = "overview" | "work" | "content" | "media" | "reports" | "audit";
const NAV: ReadonlyArray<{ key: Tab; label: string; icon: IconName }> = [
  { key: "overview", label: "نظرة عامة", icon: "home" },
  { key: "work", label: "صندوق العمل", icon: "issues" },
  { key: "content", label: "المحتوى", icon: "knowledge" },
  { key: "media", label: "المختصرات", icon: "video" },
  { key: "reports", label: "التقارير", icon: "copy" },
  { key: "audit", label: "سجل التغييرات", icon: "clock" },
];

function dayLabel(day: string): string {
  return new Intl.DateTimeFormat("ar-SA", { weekday: "short" }).format(new Date(`${day}T12:00:00+03:00`));
}

function actionLabel(action: string): string {
  if (action.includes("faq.create")) return "إضافة سؤال";
  if (action.includes("faq.update")) return "تعديل سؤال";
  if (action.includes("faq.import")) return "استيراد أسئلة";
  if (action.includes("knowledge")) return "تعديل معلومات التحول";
  if (action.includes("journey")) return "تعديل رحلة التحول";
  if (action.includes("media")) return "تعديل المختصرات";
  if (action.includes("report")) return "إصدار تقرير";
  return action.replaceAll("admin.", "").replaceAll("content.", "");
}

export function AmbassadorControlCenter({ topics, initialInbox, initialIssues, initialSnapshot }: WorkProps & { initialSnapshot: ControlSnapshot }) {
  const [tab, setTab] = useState<Tab>("overview");
  const [snapshot, setSnapshot] = useState(initialSnapshot);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setRefreshing(true); setMessage(null);
    try { setSnapshot(await apiGet<ControlSnapshot>("/api/admin/control")); }
    catch (error) { setMessage(errorMessage(error)); }
    finally { setRefreshing(false); }
  }, []);

  const maxTopic = Math.max(1, ...snapshot.topTopics.map((item) => item.count));
  const maxTrend = Math.max(1, ...snapshot.trend.map((item) => item.count));
  const kpis = [
    { label: "مشاركات 7 أيام", value: snapshot.kpis.submissions7d, hint: `من ${snapshot.kpis.submissionsTotal} إجمالي`, tab: "work" as Tab },
    { label: "متأخرات تحتاج تدخل", value: snapshot.kpis.overdue, hint: "SLA مفتوح", tab: "work" as Tab, alert: snapshot.kpis.overdue > 0 },
    { label: "قضايا مفتوحة", value: snapshot.kpis.issuesOpen, hint: `${snapshot.kpis.issuesReview} تحتاج مراجعة`, tab: "work" as Tab },
    { label: "وضوح التحول", value: snapshot.kpis.clarityIndex === null ? "—" : `${snapshot.kpis.clarityIndex}%`, hint: `عينة ${snapshot.kpis.claritySample}`, tab: "reports" as Tab },
    { label: "يحتاج قراءة", value: snapshot.kpis.needsReading, hint: "ثقة تصنيف منخفضة", tab: "work" as Tab },
    { label: "شائعات بلا موقف", value: snapshot.kpis.rumorsWaiting, hint: "بانتظار توضيح", tab: "work" as Tab },
    { label: "أسئلة بلا جواب", value: snapshot.kpis.unansweredFaqs, hint: "في بنك الإجابات", tab: "content" as Tab },
    { label: "مختصرات منشورة", value: snapshot.kpis.publishedMedia, hint: snapshot.storageConfigured ? "الرفع المباشر جاهز" : "الرفع يحتاج تفعيل", tab: "media" as Tab },
  ];

  return <div className="flex flex-col gap-5">
    <div className="relative z-20 -mx-4 border-b border-line bg-bg px-4 py-3 md:sticky md:top-0 md:mx-0 md:rounded-card md:border md:bg-panel md:p-2 md:backdrop-blur">
      <div className="flex flex-wrap items-stretch gap-2 md:flex-nowrap md:items-center md:overflow-x-auto" role="tablist" aria-label="أقسام مركز التحكم">{NAV.map((item) => <button key={item.key} type="button" role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)} className={tab === item.key ? "inline-flex min-h-11 min-w-0 flex-[1_1_calc(50%-0.25rem)] items-center justify-center gap-2 rounded-button bg-hh-2736 px-3 text-secondary font-bold text-panel md:w-auto md:flex-none md:shrink-0 md:px-4" : "inline-flex min-h-11 min-w-0 flex-[1_1_calc(50%-0.25rem)] items-center justify-center gap-2 rounded-button px-3 text-secondary text-ink-soft hover:bg-panel-2 md:w-auto md:flex-none md:shrink-0 md:px-4"}><Icon name={item.icon} size={16} /><span>{item.label}</span></button>)}<button type="button" onClick={() => void refresh()} disabled={refreshing} className="inline-flex min-h-11 w-full flex-none items-center justify-center gap-2 rounded-button px-3 text-secondary text-muted hover:bg-panel-2 md:ms-auto md:w-auto md:shrink-0"><Icon name="retry" size={15} />{refreshing ? "تحديث…" : "تحديث"}</button></div>
    </div>
    {message ? <p role="status" className="rounded-card border border-line bg-panel p-3 text-secondary text-ink-soft">{message}</p> : null}

    {tab === "overview" ? <div className="flex flex-col gap-5">
      <section><div className="mb-3 flex items-end justify-between gap-3"><div><h2 className="text-screen-title font-bold text-ink">وش يحتاج انتباهك اليوم؟</h2><p className="text-secondary text-muted">لقطة تشغيلية من البيانات الحالية — بدون نصوص موظفين في المؤشرات.</p></div><span className="hidden text-tag text-faint sm:block">آخر تحديث {new Date(snapshot.generatedAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span></div><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{kpis.map((item) => <button key={item.label} type="button" onClick={() => setTab(item.tab)} className={item.alert ? "surface-raise flex min-h-32 flex-col items-start justify-between rounded-card border border-hh-072 bg-status-escalated-tint p-4 text-start" : "surface-raise flex min-h-32 flex-col items-start justify-between rounded-card p-4 text-start"}><span className={item.alert ? "text-secondary font-bold text-hh-072" : "text-secondary font-bold text-muted"}>{item.label}</span><span className="text-[30px] font-bold leading-none text-ink">{item.value}</span><span className="text-tag text-faint">{item.hint}</span></button>)}</div></section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="surface-raise rounded-card p-4"><div className="flex items-end justify-between"><div><h2 className="text-card-title font-bold text-ink">خريطة الاهتمام</h2><p className="text-secondary text-muted">Heatmap لآخر 7 أيام حسب الموضوع.</p></div><button type="button" className="min-h-11 text-secondary font-bold text-hh-2736" onClick={() => setTab("reports")}>تصدير البيانات</button></div>{snapshot.heatmap.topics.length === 0 ? <div className="mt-4 rounded-button bg-panel-2 p-6 text-center text-secondary text-muted">ما فيه بيانات كافية بعد.</div> : <div className="mt-4 overflow-x-auto"><div className="min-w-[620px]"><div className="grid grid-cols-[150px_repeat(7,minmax(52px,1fr))] gap-1"><div /><>{snapshot.heatmap.days.map((day) => <div key={day} className="p-1 text-center text-tag font-bold text-muted">{dayLabel(day)}</div>)}</>{snapshot.heatmap.topics.map((topic) => <div key={topic.key} className="contents"><div className="flex items-center pe-2 text-secondary font-bold text-ink-soft">{topic.label}</div>{snapshot.heatmap.days.map((day) => { const count = snapshot.heatmap.cells.find((cell) => cell.day === day && cell.topic === topic.key)?.count ?? 0; const opacity = count === 0 ? 0 : 0.12 + 0.78 * (count / snapshot.heatmap.max); return <div key={`${topic.key}-${day}`} className="relative flex min-h-12 items-center justify-center overflow-hidden rounded-button border border-line bg-panel-2" title={`${topic.label} · ${day}: ${count}`}><span aria-hidden className="absolute inset-0 bg-hh-2736" style={{ opacity }} /><span className={count > snapshot.heatmap.max * 0.55 ? "relative font-bold text-panel" : "relative font-bold text-ink-soft"}>{count || "·"}</span></div>; })}</div>)}</div></div></div>}</section>

        <section className="surface-raise flex flex-col gap-4 rounded-card p-4"><div><h2 className="text-card-title font-bold text-ink">أكثر المواضيع حركة</h2><p className="text-secondary text-muted">آخر 30 يومًا.</p></div><div className="flex flex-col gap-3">{snapshot.topTopics.length === 0 ? <p className="text-secondary text-muted">ما فيه بيانات بعد.</p> : snapshot.topTopics.map((item) => <div key={item.key}><div className="mb-1 flex items-center justify-between gap-3 text-secondary"><span className="font-bold text-ink-soft">{item.label}</span><span className="text-muted">{item.count}</span></div><div className="h-2.5 overflow-hidden rounded-full bg-panel-2"><div className="h-full rounded-full bg-hh-2736" style={{ width: `${Math.max(4, (item.count / maxTopic) * 100)}%` }} /></div></div>)}</div></section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <section className="surface-raise flex flex-col gap-4 rounded-card p-4"><div><h2 className="text-card-title font-bold text-ink">حركة المشاركات</h2><p className="text-secondary text-muted">آخر 14 يومًا.</p></div><div className="flex h-44 items-end gap-1.5">{snapshot.trend.map((item) => <div key={item.day} className="group flex min-w-0 flex-1 flex-col items-center justify-end gap-1" title={`${item.day}: ${item.count}`}><span className="text-[10px] text-faint opacity-0 transition-opacity group-hover:opacity-100">{item.count}</span><div className="w-full rounded-t bg-hh-2736" style={{ height: `${Math.max(4, (item.count / maxTrend) * 120)}px` }} /><span className="hidden text-[9px] text-faint md:block">{item.day.slice(8)}</span></div>)}</div></section>
        <section className="surface-raise flex flex-col gap-3 rounded-card p-4"><div><h2 className="text-card-title font-bold text-ink">أفعال سريعة</h2><p className="text-secondary text-muted">أكثر الأشياء اللي تحتاجها من اللوحة.</p></div><div className="grid grid-cols-2 gap-2">{([ ["work", "راجع الوارد", "issues"], ["content", "أضف سؤال", "question"], ["media", "ارفع مختصر", "video"], ["reports", "أصدر تقرير", "copy"] ] as const).map(([key, label, icon]) => <button key={key} type="button" onClick={() => setTab(key)} className="flex min-h-24 flex-col items-start justify-between rounded-card border border-line bg-panel-2 p-3 text-start hover:border-hh-2736"><Icon name={icon} size={20} /><span className="text-secondary font-bold text-ink">{label}</span></button>)}</div></section>
      </div>
    </div> : null}

    {tab === "work" ? <AdminDashboard topics={topics} initialInbox={initialInbox} initialIssues={initialIssues} /> : null}
    {tab === "content" ? <AdminContentManager snapshot={snapshot} topics={topics} onSnapshot={setSnapshot} /> : null}
    {tab === "media" ? <AdminMediaManager snapshot={snapshot} onSnapshot={setSnapshot} /> : null}
    {tab === "reports" ? <AdminReports snapshot={snapshot} /> : null}
    {tab === "audit" ? <section className="surface-raise rounded-card p-4"><div className="mb-4"><h2 className="text-card-title font-bold text-ink">سجل التغييرات</h2><p className="text-secondary text-muted">آخر 40 إجراء إداري. السجل ما يحفظ نصوص الموظفين أو معرّفات أجهزتهم.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[620px] border-collapse text-start"><thead><tr className="border-b border-line text-secondary text-muted"><th className="p-3 text-start">الإجراء</th><th className="p-3 text-start">النوع</th><th className="p-3 text-start">الوقت</th></tr></thead><tbody>{snapshot.audit.map((row) => <tr key={row.id} className="border-b border-line last:border-0"><td className="p-3 text-body font-bold text-ink">{actionLabel(row.action)}</td><td className="p-3 text-secondary text-muted">{row.entity}</td><td className="p-3 text-secondary text-muted">{new Date(row.at).toLocaleString("ar-SA")}</td></tr>)}</tbody></table></div></section> : null}
  </div>;
}