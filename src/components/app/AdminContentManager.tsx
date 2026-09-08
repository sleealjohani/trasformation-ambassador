"use client";

import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { apiSend, errorMessage } from "@/lib/api";
import type { AdminTopic, ControlSnapshot, ControlSnapshotSetter } from "./admin-control-types";

type Section = "faq" | "knowledge" | "journey";
type FaqDraft = { id?: string; question: string; answer: string; source: string; topic: string };
type KnowledgeDraft = { id?: string; kind: "known" | "unclear" | "changed"; title: string; body: string; source: string; sort: number };
type JourneyDraft = { id?: string; sort: number; title: string; state: "done" | "current" | "upcoming"; whatHappens: string; employeeAction: string; openQuestions: string };

const field = "min-h-11 w-full rounded-button border border-line bg-panel px-3 py-2 text-body text-ink outline-none focus-visible:border-hh-2736";
const area = `${field} min-h-28 resize-y`;

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function downloadText(fileName: string, text: string, type = "text/csv;charset=utf-8") {
  const blob = new Blob([text], { type });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(href);
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;
  const source = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    if (quoted) {
      if (ch === '"' && source[i + 1] === '"') { value += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else value += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(value.trim()); value = ""; }
    else if (ch === "\n") { row.push(value.trim().replace(/\r$/, "")); if (row.some(Boolean)) rows.push(row); row = []; value = ""; }
    else value += ch;
  }
  row.push(value.trim().replace(/\r$/, ""));
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function headerIndex(headers: string[], choices: string[]): number {
  return headers.findIndex((header) => choices.includes(header.trim().toLowerCase()));
}

export function AdminContentManager({ snapshot, topics, onSnapshot }: { snapshot: ControlSnapshot; topics: AdminTopic[]; onSnapshot: ControlSnapshotSetter }) {
  const [section, setSection] = useState<Section>("faq");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const defaultTopic = topics[0]?.slug ?? "other";
  const [faq, setFaq] = useState<FaqDraft>({ question: "", answer: "", source: "", topic: defaultTopic });
  const [knowledge, setKnowledge] = useState<KnowledgeDraft>({ kind: "known", title: "", body: "", source: "", sort: 0 });
  const [journey, setJourney] = useState<JourneyDraft>({ sort: snapshot.journey.length + 1, title: "", state: "upcoming", whatHappens: "", employeeAction: "", openQuestions: "" });

  async function mutate(body: Record<string, unknown>, success: string) {
    setBusy(true); setMessage(null);
    try {
      const next = await apiSend<ControlSnapshot>("/api/admin/control", body);
      onSnapshot(next);
      setMessage(success);
      return true;
    } catch (error) {
      setMessage(errorMessage(error));
      return false;
    } finally { setBusy(false); }
  }

  async function saveFaq() {
    if (!faq.question.trim()) return;
    const ok = await mutate({ action: "faq.save", id: faq.id, question: faq.question, answer: faq.answer || null, source: faq.source || null, topic: faq.topic }, faq.id ? "تم تحديث السؤال." : "تمت إضافة السؤال.");
    if (ok) setFaq({ question: "", answer: "", source: "", topic: defaultTopic });
  }

  async function saveKnowledge() {
    if (!knowledge.title.trim() || !knowledge.body.trim() || !knowledge.source.trim()) return;
    const ok = await mutate({ action: "knowledge.save", ...knowledge }, knowledge.id ? "تم تحديث البطاقة." : "تمت إضافة البطاقة.");
    if (ok) setKnowledge({ kind: "known", title: "", body: "", source: "", sort: 0 });
  }

  async function saveJourney() {
    if (!journey.title.trim() || !journey.whatHappens.trim() || !journey.employeeAction.trim()) return;
    const ok = await mutate({ action: "journey.save", id: journey.id, sort: journey.sort, title: journey.title, state: journey.state, whatHappens: journey.whatHappens, employeeAction: journey.employeeAction, openQuestions: journey.openQuestions.split("\n").map((item) => item.trim()).filter(Boolean) }, journey.id ? "تم تحديث المرحلة." : "تمت إضافة المرحلة.");
    if (ok) setJourney({ sort: snapshot.journey.length + 2, title: "", state: "upcoming", whatHappens: "", employeeAction: "", openQuestions: "" });
  }

  async function remove(entity: "faq" | "knowledge" | "journey", id: string) {
    if (!window.confirm("متأكد من الحذف؟")) return;
    await mutate({ action: "entity.delete", entity, id }, "تم الحذف.");
  }

  async function importFaqFile(file: File) {
    setMessage(null);
    const rows = parseCsv(await file.text());
    if (rows.length < 2) { setMessage("الملف ما فيه صفوف كافية."); return; }
    const headers = (rows[0] ?? []).map((item) => item.toLowerCase());
    const qi = headerIndex(headers, ["question", "السؤال"]);
    const ai = headerIndex(headers, ["answer", "الإجابة", "الاجابة"]);
    const si = headerIndex(headers, ["source", "المصدر"]);
    const ti = headerIndex(headers, ["topic", "الموضوع"]);
    if (qi < 0) { setMessage("لازم يكون فيه عمود question أو السؤال."); return; }
    const mapped = rows.slice(1).map((row) => {
      const rawTopic = ti >= 0 ? row[ti]?.trim() : "";
      const topic = topics.find((item) => item.slug === rawTopic || item.label === rawTopic)?.slug ?? defaultTopic;
      return { question: row[qi] ?? "", answer: ai >= 0 ? row[ai] || null : null, source: si >= 0 ? row[si] || null : null, topic };
    }).filter((row) => row.question.trim());
    if (mapped.length === 0) { setMessage("ما لقينا أسئلة صالحة للاستيراد."); return; }
    await mutate({ action: "faq.import", rows: mapped }, `تم استيراد ${mapped.length} سؤال.`);
    if (importRef.current) importRef.current.value = "";
  }

  function exportFaqs() {
    const lines = ["question,answer,source,topic", ...snapshot.faqs.map((item) => [item.question, item.answer ?? "", item.source ?? "", item.topic].map(csvEscape).join(","))];
    downloadText("bridge-faqs.csv", `\uFEFF${lines.join("\n")}`);
  }

  const faqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? snapshot.faqs.filter((item) => `${item.question} ${item.answer ?? ""} ${item.topicLabel}`.toLowerCase().includes(q)) : snapshot.faqs;
  }, [snapshot.faqs, query]);

  return <div className="flex flex-col gap-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex gap-2 overflow-x-auto" role="tablist" aria-label="إدارة المحتوى">
        {([ ["faq", "الأسئلة والإجابات"], ["knowledge", "معلومات التحول"], ["journey", "رحلة التحول"] ] as const).map(([key, label]) => <button key={key} type="button" role="tab" aria-selected={section === key} onClick={() => setSection(key)} className={section === key ? "min-h-11 shrink-0 rounded-tag bg-hh-2736 px-4 text-secondary font-bold text-panel" : "min-h-11 shrink-0 rounded-tag border border-line bg-panel px-4 text-secondary text-ink-soft"}>{label}</button>)}
      </div>
      {section === "faq" ? <div className="flex gap-2"><input ref={importRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { const file = e.target.files?.[0]; if (file) void importFaqFile(file); }} /><Button variant="secondary" onClick={() => importRef.current?.click()} disabled={busy}><Icon name="plus" size={15} />استيراد CSV</Button><Button variant="secondary" onClick={exportFaqs}><Icon name="copy" size={15} />تصدير</Button></div> : null}
    </div>

    {message ? <p role="status" className="rounded-card border border-line bg-panel p-3 text-secondary text-ink-soft">{message}</p> : null}

    {section === "faq" ? <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)]">
      <form onSubmit={(e) => { e.preventDefault(); void saveFaq(); }} className="surface-raise flex h-fit flex-col gap-3 rounded-card p-4 xl:sticky xl:top-4">
        <div className="flex items-center justify-between"><h2 className="text-card-title font-bold text-ink">{faq.id ? "تعديل سؤال" : "إضافة سؤال"}</h2>{faq.id ? <button type="button" onClick={() => setFaq({ question: "", answer: "", source: "", topic: defaultTopic })} className="min-h-11 px-2 text-secondary text-muted">إلغاء</button> : null}</div>
        <label className="text-secondary font-bold text-ink-soft">السؤال<input className={`${field} mt-1`} value={faq.question} onChange={(e) => setFaq({ ...faq, question: e.target.value })} /></label>
        <label className="text-secondary font-bold text-ink-soft">الإجابة<textarea className={`${area} mt-1`} value={faq.answer} onChange={(e) => setFaq({ ...faq, answer: e.target.value })} placeholder="اتركها فاضية إذا ما صدر جواب رسمي" /></label>
        <label className="text-secondary font-bold text-ink-soft">المصدر<input className={`${field} mt-1`} value={faq.source} onChange={(e) => setFaq({ ...faq, source: e.target.value })} placeholder="مثلاً: الصحة القابضة · كتيب الأسئلة الشائعة" /></label>
        <label className="text-secondary font-bold text-ink-soft">الموضوع<select className={`${field} mt-1`} value={faq.topic} onChange={(e) => setFaq({ ...faq, topic: e.target.value })}>{topics.map((topic) => <option key={topic.slug} value={topic.slug}>{topic.label}</option>)}</select></label>
        <Button type="submit" disabled={busy || !faq.question.trim()}>{faq.id ? "حفظ التعديل" : "إضافة السؤال"}</Button>
      </form>
      <section className="flex min-w-0 flex-col gap-3"><div className="flex items-center justify-between gap-3"><div><h2 className="text-card-title font-bold text-ink">بنك الأسئلة</h2><p className="text-secondary text-muted">{snapshot.faqs.length} سؤال — أي تعديل يظهر في صفحة الإجابات.</p></div><input aria-label="بحث في بنك الأسئلة" className="min-h-11 w-full max-w-xs rounded-button border border-line bg-panel px-3 text-secondary outline-none focus-visible:border-hh-2736" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث…" /></div>
        <div className="flex flex-col gap-2">{faqs.map((item) => <article key={item.id} className="rounded-card border border-line bg-panel p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="text-body font-bold text-ink">{item.question}</h3><p className="mt-1 line-clamp-2 text-secondary text-muted">{item.answer ?? "ما صدر جواب رسمي إلى الآن."}</p><div className="mt-2 flex flex-wrap gap-2 text-tag text-muted"><span>{item.topicLabel}</span><span>اهتمام {item.interestCount}</span><span>{item.answer ? "مجاب" : "بانتظار جواب"}</span></div></div><div className="flex shrink-0 gap-1"><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-2736 hover:bg-tint" onClick={() => setFaq({ id: item.id, question: item.question, answer: item.answer ?? "", source: item.source ?? "", topic: item.topic })}>تعديل</button><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-072 hover:bg-status-escalated-tint" onClick={() => void remove("faq", item.id)}>حذف</button></div></div></article>)}</div>
      </section>
    </div> : null}

    {section === "knowledge" ? <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)]">
      <form onSubmit={(e) => { e.preventDefault(); void saveKnowledge(); }} className="surface-raise flex h-fit flex-col gap-3 rounded-card p-4 xl:sticky xl:top-4"><div className="flex items-center justify-between"><h2 className="text-card-title font-bold text-ink">{knowledge.id ? "تعديل بطاقة" : "إضافة معلومة"}</h2>{knowledge.id ? <button type="button" className="min-h-11 text-secondary text-muted" onClick={() => setKnowledge({ kind: "known", title: "", body: "", source: "", sort: 0 })}>إلغاء</button> : null}</div>
        <label className="text-secondary font-bold text-ink-soft">النوع<select className={`${field} mt-1`} value={knowledge.kind} onChange={(e) => setKnowledge({ ...knowledge, kind: e.target.value as KnowledgeDraft["kind"] })}><option value="known">نعرف</option><option value="unclear">لم يتضح</option><option value="changed">ما الذي تغيّر</option></select></label>
        <label className="text-secondary font-bold text-ink-soft">العنوان<input className={`${field} mt-1`} value={knowledge.title} onChange={(e) => setKnowledge({ ...knowledge, title: e.target.value })} /></label>
        <label className="text-secondary font-bold text-ink-soft">المحتوى<textarea className={`${area} mt-1`} value={knowledge.body} onChange={(e) => setKnowledge({ ...knowledge, body: e.target.value })} /></label>
        <label className="text-secondary font-bold text-ink-soft">المصدر<input className={`${field} mt-1`} value={knowledge.source} onChange={(e) => setKnowledge({ ...knowledge, source: e.target.value })} /></label>
        <label className="text-secondary font-bold text-ink-soft">الترتيب<input type="number" min={0} className={`${field} mt-1`} value={knowledge.sort} onChange={(e) => setKnowledge({ ...knowledge, sort: Number(e.target.value) })} /></label>
        <Button type="submit" disabled={busy || !knowledge.title.trim() || !knowledge.body.trim() || !knowledge.source.trim()}>حفظ</Button>
      </form>
      <div className="flex flex-col gap-2">{snapshot.knowledge.map((item) => <article key={item.id} className="rounded-card border border-line bg-panel p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-tag font-bold text-hh-2736">{item.kind === "known" ? "نعرف" : item.kind === "unclear" ? "لم يتضح" : "تغيّر"}</p><h3 className="mt-1 text-body font-bold text-ink">{item.title}</h3><p className="mt-1 line-clamp-3 text-secondary text-muted">{item.body}</p><p className="mt-2 text-tag text-faint">المصدر: {item.source}</p></div><div className="flex shrink-0 gap-1"><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-2736" onClick={() => setKnowledge({ id: item.id, kind: item.kind as KnowledgeDraft["kind"], title: item.title, body: item.body, source: item.source, sort: item.sort })}>تعديل</button><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-072" onClick={() => void remove("knowledge", item.id)}>حذف</button></div></div></article>)}</div>
    </div> : null}

    {section === "journey" ? <div className="grid gap-5 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.4fr)]">
      <form onSubmit={(e) => { e.preventDefault(); void saveJourney(); }} className="surface-raise flex h-fit flex-col gap-3 rounded-card p-4 xl:sticky xl:top-4"><div className="flex items-center justify-between"><h2 className="text-card-title font-bold text-ink">{journey.id ? "تعديل مرحلة" : "إضافة مرحلة"}</h2>{journey.id ? <button type="button" className="min-h-11 text-secondary text-muted" onClick={() => setJourney({ sort: snapshot.journey.length + 1, title: "", state: "upcoming", whatHappens: "", employeeAction: "", openQuestions: "" })}>إلغاء</button> : null}</div>
        <div className="grid grid-cols-2 gap-2"><label className="text-secondary font-bold text-ink-soft">الترتيب<input type="number" min={0} className={`${field} mt-1`} value={journey.sort} onChange={(e) => setJourney({ ...journey, sort: Number(e.target.value) })} /></label><label className="text-secondary font-bold text-ink-soft">الحالة<select className={`${field} mt-1`} value={journey.state} onChange={(e) => setJourney({ ...journey, state: e.target.value as JourneyDraft["state"] })}><option value="done">مكتملة</option><option value="current">الحالية</option><option value="upcoming">قادمة</option></select></label></div>
        <label className="text-secondary font-bold text-ink-soft">اسم المرحلة<input className={`${field} mt-1`} value={journey.title} onChange={(e) => setJourney({ ...journey, title: e.target.value })} /></label>
        <label className="text-secondary font-bold text-ink-soft">وش يصير؟<textarea className={`${area} mt-1`} value={journey.whatHappens} onChange={(e) => setJourney({ ...journey, whatHappens: e.target.value })} /></label>
        <label className="text-secondary font-bold text-ink-soft">وش المطلوب من الموظف؟<textarea className={`${area} mt-1`} value={journey.employeeAction} onChange={(e) => setJourney({ ...journey, employeeAction: e.target.value })} /></label>
        <label className="text-secondary font-bold text-ink-soft">أسئلة مفتوحة — سؤال بكل سطر<textarea className={`${area} mt-1`} value={journey.openQuestions} onChange={(e) => setJourney({ ...journey, openQuestions: e.target.value })} /></label>
        <Button type="submit" disabled={busy}>حفظ المرحلة</Button>
      </form>
      <div className="flex flex-col gap-2">{snapshot.journey.map((item) => <article key={item.id} className="rounded-card border border-line bg-panel p-4"><div className="flex items-start justify-between gap-3"><div><div className="flex gap-2 text-tag"><span className="font-bold text-hh-2736">مرحلة {item.sort}</span><span className="text-muted">{item.state === "current" ? "الحالية" : item.state === "done" ? "مكتملة" : "قادمة"}</span></div><h3 className="mt-1 text-body font-bold text-ink">{item.title}</h3><p className="mt-1 text-secondary text-muted">{item.whatHappens}</p></div><div className="flex shrink-0 gap-1"><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-2736" onClick={() => setJourney({ id: item.id, sort: item.sort, title: item.title, state: item.state as JourneyDraft["state"], whatHappens: item.whatHappens, employeeAction: item.employeeAction, openQuestions: item.openQuestions.join("\n") })}>تعديل</button><button type="button" className="min-h-11 rounded-tag px-3 text-secondary text-hh-072" onClick={() => void remove("journey", item.id)}>حذف</button></div></div></article>)}</div>
    </div> : null}
  </div>;
}
