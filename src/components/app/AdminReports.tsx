"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { apiGet, errorMessage } from "@/lib/api";
import type { ControlSnapshot } from "./admin-control-types";

type Weekly = { week: string; text: string; generatedAt?: string };

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function download(fileName: string, text: string, type: string) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = fileName; a.click(); URL.revokeObjectURL(url);
}

export function AdminReports({ snapshot }: { snapshot: ControlSnapshot }) {
  const [weekly, setWeekly] = useState<Weekly | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const executive = useMemo(() => {
    const top = snapshot.topTopics[0];
    return [
      `وصلت ${snapshot.kpis.submissions7d} مشاركة خلال آخر 7 أيام.`,
      top ? `أكثر موضوع حاضر الآن: ${top.label} (${top.count} مشاركة خلال آخر 30 يومًا).` : "ما فيه موضوع متصدر إلى الآن.",
      snapshot.kpis.overdue > 0 ? `فيه ${snapshot.kpis.overdue} حالة متأخرة تحتاج متابعة.` : "ما فيه حالات متأخرة حاليًا.",
      snapshot.kpis.unansweredFaqs > 0 ? `${snapshot.kpis.unansweredFaqs} سؤال في بنك الإجابات ما زال بلا جواب.` : "بنك الأسئلة الحالي مجاب بالكامل.",
      snapshot.kpis.clarityIndex === null ? "مؤشر وضوح التحول ما زال بدون عينة منشورة كافية." : `مؤشر وضوح التحول: ${snapshot.kpis.clarityIndex}% على عينة ${snapshot.kpis.claritySample}.`,
    ];
  }, [snapshot]);

  async function generate() {
    setBusy(true); setMessage(null);
    try { setWeekly(await apiGet<Weekly>("/api/admin/report/weekly")); }
    catch (error) { setMessage(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function exportHeatmap() {
    const label = new Map(snapshot.heatmap.topics.map((item) => [item.key, item.label]));
    const rows = ["day,topic,count", ...snapshot.heatmap.cells.map((item) => [item.day, label.get(item.topic) ?? item.topic, item.count].map(csvEscape).join(","))];
    download("bridge-heatmap.csv", `\uFEFF${rows.join("\n")}`, "text/csv;charset=utf-8");
  }

  function exportFaqs() {
    const rows = ["question,answer,source,topic", ...snapshot.faqs.map((item) => [item.question, item.answer ?? "", item.source ?? "", item.topic].map(csvEscape).join(","))];
    download("bridge-faqs.csv", `\uFEFF${rows.join("\n")}`, "text/csv;charset=utf-8");
  }

  return <div className="grid gap-5 xl:grid-cols-2">
    <section className="surface-raise flex flex-col gap-4 rounded-card p-4"><div><h2 className="text-card-title font-bold text-ink">ملخص تنفيذي</h2><p className="text-secondary text-muted">يتولد بقواعد ثابتة من الأرقام الحالية — بدون ذكاء اصطناعي.</p></div><ul className="flex flex-col gap-2">{executive.map((line) => <li key={line} className="rounded-button bg-panel-2 p-3 text-body text-ink-soft">{line}</li>)}</ul><div className="grid grid-cols-2 gap-2"><Button variant="secondary" onClick={exportHeatmap}><Icon name="copy" size={15} />بيانات Heatmap</Button><Button variant="secondary" onClick={exportFaqs}><Icon name="copy" size={15} />بنك الأسئلة CSV</Button></div></section>
    <section className="surface-raise flex flex-col gap-4 rounded-card p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="text-card-title font-bold text-ink">تقرير الأسبوع</h2><p className="text-secondary text-muted">تقرير مجمّع يحترم عتبة الخصوصية ولا يحتوي نصوص الموظفين.</p></div><Button variant="secondary" onClick={() => void generate()} disabled={busy}><Icon name="retry" size={15} />{weekly ? "تحديث" : "توليد"}</Button></div>{message ? <p role="status" className="rounded-button bg-panel-2 p-3 text-secondary text-ink-soft">{message}</p> : null}{weekly ? <><pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-button border border-line bg-panel-2 p-4 text-secondary leading-7 text-ink" data-testid="control-weekly-report">{weekly.text}</pre><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => void navigator.clipboard.writeText(weekly.text)}><Icon name="copy" size={15} />نسخ</Button><Button variant="secondary" onClick={() => download(`bridge-${weekly.week}.txt`, weekly.text, "text/plain;charset=utf-8")}><Icon name="send" size={15} />تنزيل TXT</Button><Button variant="secondary" onClick={() => window.print()}><Icon name="knowledge" size={15} />طباعة / PDF</Button></div></> : <div className="flex min-h-48 items-center justify-center rounded-button border border-dashed border-line text-secondary text-muted">اضغط «توليد» لإصدار التقرير الحالي.</div>}</section>
  </div>;
}
