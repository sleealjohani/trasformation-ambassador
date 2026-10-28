"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { SkeletonList } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";
import { useMounted } from "@/lib/client-only";
import { DRAFT_KEY, readLocal, writeLocal } from "@/lib/storage";
import type { Gate } from "@/lib/classify";

export type Draft = { gate: Gate; body: string; answers: Record<string, string>; dept: string | null };
const GATES: readonly Gate[] = ["question", "concern", "challenge", "idea"];
export function isGate(value: string | null): value is Gate { return value !== null && (GATES as readonly string[]).includes(value); }
export function emptyDraft(gate: Gate): Draft { return { gate, body: "", answers: {}, dept: null }; }

export function AskFlow() {
  const params = useSearchParams();
  const gateParam = params.get("gate");
  const gate: Gate = isGate(gateParam) ? gateParam : "question";
  const prefill = params.get("t") ?? "";
  const mounted = useMounted();
  if (!mounted) return <SkeletonList count={2} />;
  return <AskFlowClient key={`${gate}:${prefill}`} gate={gate} prefill={prefill} />;
}

function AskFlowClient({ gate, prefill }: { gate: Gate; prefill: string }) {
  const router = useRouter();
  const saved = useMemo(() => { const stored = readLocal<Draft>(DRAFT_KEY); return stored && stored.gate === gate ? stored : null; }, [gate]);
  const [body, setBody] = useState(() => prefill || saved?.body || "");
  const canContinue = body.trim().length >= 3;

  useEffect(() => {
    if (!body.trim()) return;
    writeLocal(DRAFT_KEY, { gate, body, answers: saved?.answers ?? {}, dept: saved?.dept ?? null } satisfies Draft);
  }, [body, gate, saved]);

  function review() {
    if (!canContinue) return;
    writeLocal(DRAFT_KEY, { gate, body: body.trim(), answers: saved?.answers ?? {}, dept: saved?.dept ?? null } satisfies Draft);
    router.push("/ask/review");
  }

  return <div className="flex flex-col gap-4">
    {gate === "question" ? <Link href="/info" className="surface-raise lift flex items-center gap-3 rounded-card p-4"><span className="inline-flex size-9 shrink-0 items-center justify-center rounded-icon bg-tint text-hh-2736"><Icon name="info" size={18} /></span><span className="flex-1"><b className="block text-body text-ink">يمكن جوابك موجود أصلًا</b><span className="text-secondary text-muted">جرّب المعلومات الرسمية قبل ما ترسل</span></span><Icon name="forward" size={16} /></Link> : null}
    <section className="surface-raise flex flex-col gap-3 rounded-card p-4">
      <label htmlFor="ask-input" className="text-card-title font-bold text-ink">{STRINGS.gateOpeners[gate]}</label>
      <textarea id="ask-input" aria-label="اكتب مشاركتك" value={body} onChange={(e) => setBody(e.target.value)} rows={7} maxLength={2000} autoFocus className="w-full resize-none rounded-card border border-line bg-panel-2 p-4 text-body text-ink outline-none transition-colors focus-visible:border-hh-2736" placeholder="اكتب هنا…" />
      <p className="text-secondary text-muted">اكتب بطريقتك، وإحنا ننقّي أي بيانات ممكن تدل عليك قبل ما تنحفظ.</p>
    </section>
    <Button full onClick={review} disabled={!canContinue}><span>راجع وأرسل</span><Icon name="forward" size={16} /></Button>
    <Link href="/share" className="inline-flex min-h-11 items-center justify-center text-secondary text-muted">أبي أختار نوع مشاركة ثاني</Link>
  </div>;
}
