"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMounted } from "@/lib/client-only";
import { useRouter, useSearchParams } from "next/navigation";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { STRINGS } from "@/content/strings";
import { DRAFT_KEY, readLocal, writeLocal } from "@/lib/storage";
import { toArabicDigits } from "@/lib/numerals";
import { cn } from "@/lib/cn";
import { SkeletonList } from "@/components/ui/States";
import type { Gate } from "@/lib/classify";

export type Draft = {
  gate: Gate;
  body: string;
  answers: Record<string, string>;
  dept: string | null;
};

const GATES: readonly Gate[] = ["question", "concern", "challenge", "idea"];

export function isGate(value: string | null): value is Gate {
  return value !== null && (GATES as readonly string[]).includes(value);
}

export function emptyDraft(gate: Gate): Draft {
  return { gate, body: "", answers: {}, dept: null };
}

type Turn = { role: "ai" | "employee"; text: string };

export function AskFlow() {
  const params = useSearchParams();
  const gateParam = params.get("gate");
  const gate: Gate = isGate(gateParam) ? gateParam : "question";
  const prefill = params.get("t") ?? "";
  const mounted = useMounted();

  // المسودة تُقرأ من التخزين المحلي بعد التركيب فقط
  if (!mounted) return <SkeletonList count={2} />;
  return <AskFlowClient key={gate} gate={gate} prefill={prefill} />;
}

function AskFlowClient({ gate, prefill }: { gate: Gate; prefill: string }) {
  const router = useRouter();
  const followUps = STRINGS.followUps;

  const saved = useMemo(() => {
    const stored = readLocal<Draft>(DRAFT_KEY);
    return stored && stored.gate === gate && (stored.body.length > 0 || Object.keys(stored.answers).length > 0) ? stored : null;
  }, [gate]);

  const [draft, setDraft] = useState<Draft>(() => saved ?? emptyDraft(gate));
  const [step, setStep] = useState(() => (saved?.body ? Math.min(1 + Object.keys(saved.answers).length, followUps.length) : 0));
  const [input, setInput] = useState(prefill);
  const restored = saved !== null;
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (draft.body || Object.keys(draft.answers).length > 0) writeLocal(DRAFT_KEY, draft);
  }, [draft]);

  const turns = useMemo<Turn[]>(() => {
    const list: Turn[] = [{ role: "ai", text: STRINGS.gateOpeners[gate] }];
    if (draft.body) list.push({ role: "employee", text: draft.body });
    // السؤال المطروح حاليًا يُعرض مرة واحدة أسفل السجل، فلا يتكرر هنا
    for (const f of followUps) {
      const answer = draft.answers[f.key];
      if (answer) {
        list.push({ role: "ai", text: f.question });
        list.push({ role: "employee", text: answer });
      }
    }
    return list;
  }, [draft, gate, followUps]);

  const currentFollowUp = step >= 1 && step <= followUps.length ? followUps[step - 1] : undefined;
  const canFinish = draft.body.trim().length >= 3;

  function commit(text: string) {
    const value = text.trim();
    if (value.length < 3) return;
    if (step === 0) {
      setDraft((d) => ({ ...d, body: value }));
      setStep(1);
    } else if (currentFollowUp) {
      const key = currentFollowUp.key;
      setDraft((d) => ({ ...d, answers: { ...d.answers, [key]: value } }));
      setStep((s) => s + 1);
    }
    setInput("");
    inputRef.current?.focus();
  }

  function finish() {
    if (!canFinish) return;
    writeLocal(DRAFT_KEY, draft);
    router.push("/ask/review");
  }

  const done = step > followUps.length;

  const totalSteps = followUps.length + 1;
  const stepNow = Math.min(step + 1, totalSteps);

  return (
    <div className="flex flex-col gap-4">
      {/* مؤشّر التقدّم: ثلاث خطوات لا أكثر، ومَخرج «إنهاء الآن» متاح في كل واحدة */}
      <div className="flex items-center gap-2" role="group" aria-label={`الخطوة ${stepNow} من ${totalSteps}`}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "h-1 flex-1 rounded-tag transition-all duration-[420ms] ease-brand",
              i < stepNow ? "bg-hh-2736" : "bg-line",
            )}
          />
        ))}
        <span className="text-tag text-muted">
          {toArabicDigits(stepNow)}/{toArabicDigits(totalSteps)}
        </span>
      </div>

      {restored ? (
        <p role="status" className="rounded-card border border-line bg-status-waiting-tint p-3 text-secondary text-hh-3145">
          استعدنا ما كتبته سابقًا. أكمل من حيث توقفت.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        {turns.map((t, i) => (
          <ChatBubble key={i} side={t.role === "ai" ? "incoming" : "outgoing"}>
            {t.text}
          </ChatBubble>
        ))}
        {currentFollowUp && !done ? <ChatBubble side="incoming">{currentFollowUp.question}</ChatBubble> : null}
      </div>

      {currentFollowUp && currentFollowUp.chips.length > 0 && !done ? (
        <div className="flex flex-wrap gap-2" role="group" aria-label="اقتراحات — غير مُلزِمة">
          {currentFollowUp.chips.map((chip) => (
            <Chip key={chip} onClick={() => commit(chip)}>
              {chip}
            </Chip>
          ))}
        </div>
      ) : null}

      {!done ? (
        <div className="flex flex-col gap-2">
          <label htmlFor="ask-input" className="text-secondary text-muted">
            اكتب بحرّية — الحقل مفتوح دائمًا
          </label>
          <textarea
            id="ask-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            maxLength={2000}
            className="w-full rounded-card border border-line bg-panel p-3 text-body text-ink outline-none focus-visible:border-hh-2736"
            placeholder={step === 0 ? "اكتب هنا…" : "أضف ما تراه مهمًا…"}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => commit(input)} disabled={input.trim().length < 3}>
              <Icon name="send" size={16} />
              <span>{step === 0 ? "أرسل" : "أضف"}</span>
            </Button>
            <Button variant="secondary" onClick={finish} disabled={!canFinish}>
              إنهاء الآن
            </Button>
          </div>
        </div>
      ) : (
        <Button full onClick={finish}>
          مراجعة ما سيصل
        </Button>
      )}

      <p className="text-secondary text-muted">{STRINGS.privacyNotice}</p>
    </div>
  );
}
