"use client";

import { useState } from "react";
import { Icon, type IconName } from "@/components/ui/Icon";
import { StatusTag } from "@/components/ui/StatusTag";
import { CARD_KINDS, CARD_KIND_LABELS, type CardKind } from "@/content/card";
import { apiGet, errorMessage } from "@/lib/api";
import { toArabicDigits } from "@/lib/numerals";
import { SUBMISSION_STATES, toVisibleStatus, type SubmissionState } from "@/lib/state";
import type { CardQuestionRow } from "@/server/submissions";

const KIND_ICON: Record<CardKind, IconName> = { question: "question", concern: "concern", challenge: "challenge", idea: "idea", rumor: "rumor" };
const isKind = (k: string | null): k is CardKind => k !== null && (CARD_KINDS as readonly string[]).includes(k);
const isState = (s: string): s is SubmissionState => (SUBMISSION_STATES as readonly string[]).includes(s);

/** تبويب «أسئلة الحوار»: كل ما وصل من صفحة /q، النص المنقّى وحده، الأحدث أولًا. */
export function AdminCardQuestions({ initial }: { initial: CardQuestionRow[] }) {
  const [rows, setRows] = useState(initial);
  const [filter, setFilter] = useState<CardKind | "all">("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    setLoading(true); setMessage(null);
    try { setRows(await apiGet<CardQuestionRow[]>("/api/admin/card")); }
    catch (error) { setMessage(errorMessage(error)); }
    finally { setLoading(false); }
  }

  const shown = filter === "all" ? rows : rows.filter((r) => r.kind === filter);
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.kind ?? "none", (counts.get(r.kind ?? "none") ?? 0) + 1);

  return <section className="flex flex-col gap-4" aria-labelledby="card-questions-title">
    <div className="surface-raise flex flex-col gap-3 rounded-card p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id="card-questions-title" className="text-card-title font-bold text-ink">أسئلة «سؤالك يفتح الحوار»</h2>
          <p className="text-note text-muted">كل ما كتبه الموظفون في الصفحة المستقلة. النص بعد التنقية، بلا أي معرّف، ويظهر أيضًا في صندوق العمل للإحالة والرد.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[30px] font-bold leading-none text-ink">{toArabicDigits(rows.length)}</span>
          <button type="button" onClick={() => void refresh()} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-button border border-line bg-panel px-4 text-note font-bold text-primary-ink"><Icon name="retry" size={15} />{loading ? "تحديث…" : "تحديث"}</button>
        </div>
      </div>
      <div className="flex min-w-0 gap-2 overflow-x-auto pb-1" role="group" aria-label="تصفية حسب النوع">
        {(["all", ...CARD_KINDS] as const).map((k) => {
          const active = filter === k;
          const n = k === "all" ? rows.length : counts.get(k) ?? 0;
          return <button key={k} type="button" aria-pressed={active} onClick={() => setFilter(k)} className={active ? "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-button bg-primary px-3 text-note font-bold text-panel" : "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-button border border-line bg-panel px-3 text-note text-ink-soft"}>
            {k === "all" ? "الكل" : CARD_KIND_LABELS[k]}<span className={active ? "text-panel" : "text-muted"}>{toArabicDigits(n)}</span>
          </button>;
        })}
      </div>
    </div>

    {message ? <p role="status" className="rounded-card border border-line bg-panel p-3 text-note text-ink-soft">{message}</p> : null}

    {shown.length === 0 ? <div className="surface-raise rounded-card p-8 text-center text-note text-muted">ما وصل أي سؤال من الصفحة بعد.</div> : <ul className="grid gap-3 md:grid-cols-2" data-testid="card-questions">
      {shown.map((r) => <li key={r.id} className="surface-raise flex min-w-0 flex-col gap-3 rounded-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-tag bg-section px-2.5 py-1 text-tag font-bold text-primary-ink">
            {isKind(r.kind) ? <><Icon name={KIND_ICON[r.kind]} size={14} />{CARD_KIND_LABELS[r.kind]}</> : "بدون نوع"}
          </span>
          {isState(r.status) ? <StatusTag status={toVisibleStatus(r.status)} /> : null}
        </div>
        <p className="whitespace-pre-wrap break-words text-body text-ink">{r.bodyClean ?? "— حذفه صاحبه —"}</p>
        <time dateTime={r.createdAt} className="text-tag text-muted">{new Date(r.createdAt).toLocaleString("ar-SA", { dateStyle: "medium", timeStyle: "short" })}</time>
      </li>)}
    </ul>}
  </section>;
}
