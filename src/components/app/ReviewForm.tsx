"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ErrorState, OfflineBanner } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";
import { ApiError, apiSend, errorMessage } from "@/lib/api";
import { redact } from "@/lib/redact";
import { playSubmitSuccess } from "@/lib/sound";
import { useMounted, useOnline } from "@/lib/client-only";
import { CODES_KEY, DRAFT_KEY, OUTBOX_KEY, clearLocal, readLocal, writeLocal } from "@/lib/storage";
import type { Draft } from "./AskFlow";

type CreateResult = { refCode: string; topic: string; similarCount: number; mergedIntoIssueId?: string };
export function ReviewForm() { const mounted = useMounted(); if (!mounted) return null; return <ReviewFormClient />; }

function ReviewFormClient() {
  const router = useRouter();
  const draft = useMemo(() => { const saved = readLocal<Draft>(DRAFT_KEY); return saved && saved.body ? saved : null; }, []);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const online = useOnline();
  useEffect(() => { if (!draft) router.replace("/share"); }, [draft, router]);

  const cleaned = useMemo(() => {
    if (!draft) return null;
    const body = redact(draft.body);
    const answers: Record<string, string> = {};
    let hits = body.hits.length;
    for (const [k, v] of Object.entries(draft.answers)) { const r = redact(v); answers[k] = r.clean; hits += r.hits.length; }
    return { body: body.clean, answers, hits };
  }, [draft]);

  async function submit() {
    if (!draft || !cleaned) return;
    setSending(true); setError(null);
    const payload = { gate: draft.gate, body: cleaned.body, answers: cleaned.answers, dept: draft.dept };
    try {
      const result = await apiSend<CreateResult>("/api/submissions", payload);
      clearLocal(DRAFT_KEY);
      const codes = readLocal<string[]>(CODES_KEY) ?? [];
      writeLocal(CODES_KEY, [result.refCode, ...codes].slice(0, 20));
      writeLocal("bridge:last", result);
      playSubmitSuccess();
      router.push("/ask/done");
    } catch (err) {
      if (!navigator.onLine || (err instanceof ApiError && err.status >= 500)) { const outbox = readLocal<unknown[]>(OUTBOX_KEY) ?? []; writeLocal(OUTBOX_KEY, [...outbox, payload]); }
      setError(errorMessage(err)); setSending(false);
    }
  }

  if (!draft || !cleaned) return null;
  const answerLines = Object.entries(cleaned.answers).filter(([, v]) => v.trim().length > 0);
  return <div className="flex flex-col gap-4">
    {!online ? <OfflineBanner /> : null}
    <section aria-labelledby="what-arrives" className="surface-raise flex flex-col gap-3 rounded-card p-4"><h2 id="what-arrives" className="text-card-title font-bold text-ink">هذا اللي بيروح لسفير التغيير</h2><p className="whitespace-pre-wrap text-body text-ink">{cleaned.body}</p>{answerLines.map(([key, value]) => <p key={key} className="border-t border-line pt-3 text-secondary text-ink-soft">{STRINGS.followUps.find((f) => f.key === key)?.question}<span className="mt-1 block text-body text-ink">{value}</span></p>)}</section>
    {cleaned.hits > 0 ? <p role="status" className="flex items-center gap-2 rounded-card border border-line bg-status-waiting-tint p-3 text-secondary text-hh-3145"><Icon name="eye" size={16} /><span>{STRINGS.redactionNotice}</span></p> : null}
    <div className="rounded-card bg-tint p-3 text-secondary text-ink-soft"><b className="block text-ink">قبل الإرسال</b> ما نطلب منك اسم أو رقم وظيفي، والنص اللي فوق هو النسخة المنقّاة اللي بتنحفظ.</div>
    {error ? <ErrorState text={error} onRetry={() => void submit()} /> : null}
    <div className="flex flex-col gap-2"><Button full onClick={() => void submit()} disabled={sending}>{sending ? "جاري الإرسال…" : STRINGS.submitButton}</Button><Button variant="ghost" full onClick={() => router.push(`/ask?gate=${draft.gate}`)}>رجوع للتعديل</Button></div>
  </div>;
}
