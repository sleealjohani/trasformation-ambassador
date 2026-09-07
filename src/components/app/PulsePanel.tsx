"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ErrorState } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";
import { ApiError, apiSend, errorMessage } from "@/lib/api";
import { toArabicDigits } from "@/lib/numerals";

export type PulseWeek = { week: string; clarityIndex: number | null; sample: number; published: boolean };

const SCALE = [1, 2, 3, 4, 5] as const;
const SCALE_LABEL: Record<number, string> = { 1: "غير واضح إطلاقًا", 2: "غير واضح", 3: "متوسط", 4: "واضح", 5: "واضح تمامًا" };

function weekLabel(week: string): string {
  const [year, w] = week.split("-W");
  return `أسبوع ${toArabicDigits(w ?? "")} · ${toArabicDigits(year ?? "")}`;
}

export function PulsePanel({ weeks, currentWeek }: { weeks: PulseWeek[]; currentWeek: string }) {
  const [clarity, setClarity] = useState<number | null>(null);
  const [oneThing, setOneThing] = useState("");
  const [result, setResult] = useState<PulseWeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const history = weeks.filter((w) => w.week !== currentWeek);
  const max = Math.max(100, ...history.map((w) => w.clarityIndex ?? 0));

  async function submit() {
    if (clarity === null) return;
    setBusy(true);
    setError(null);
    try {
      const res = await apiSend<{ week: string; average?: number; sample: number; published: boolean }>("/api/pulse", {
        clarity,
        ...(oneThing.trim() ? { oneThing: oneThing.trim() } : {}),
      });
      setResult({ week: res.week, clarityIndex: res.average ?? null, sample: res.sample, published: res.published });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("سجّلت ردك لهذا الأسبوع. النتيجة المجمّعة أدناه.");
        setResult({ week: currentWeek, clarityIndex: null, sample: 0, published: false });
      } else {
        setError(errorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {result === null ? (
        <section aria-labelledby="q" className="flex flex-col gap-4 rounded-card border border-line bg-panel p-4">
          <h2 id="q" className="text-card-title font-bold text-ink">
            ما مدى وضوح التحول بالنسبة لك هذا الأسبوع؟
          </h2>
          <div role="radiogroup" aria-labelledby="q" className="flex flex-col gap-2">
            {SCALE.map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={clarity === n}
                onClick={() => setClarity(n)}
                className={
                  clarity === n
                    ? "flex min-h-11 items-center justify-between gap-3 rounded-button border border-hh-2736 bg-tint px-4 text-body font-bold text-hh-2736"
                    : "flex min-h-11 items-center justify-between gap-3 rounded-button border border-line bg-panel px-4 text-body text-ink-soft hover:bg-panel-2"
                }
              >
                <span>{SCALE_LABEL[n]}</span>
                <span className="code-ltr">{toArabicDigits(n)}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="one-thing" className="text-secondary text-muted">
              شيء واحد لو وضح لصار أسهل؟ (اختياري)
            </label>
            <textarea
              id="one-thing"
              value={oneThing}
              onChange={(e) => setOneThing(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full rounded-card border border-line bg-panel-2 p-3 text-body text-ink outline-none focus-visible:border-hh-2736"
            />
          </div>

          <Button full onClick={() => void submit()} disabled={busy || clarity === null}>
            {busy ? "جارٍ الإرسال…" : "أرسل ردّي"}
          </Button>
          <p className="text-secondary text-muted">{STRINGS.privacyNotice}</p>
        </section>
      ) : (
        <section className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
          <h2 className="flex items-center gap-2 text-card-title font-bold text-status-answered">
            <Icon name="check" size={22} />
            <span>وصل ردّك</span>
          </h2>
          {result.published && result.clarityIndex !== null ? (
            <p className="text-body text-ink">
              مؤشر وضوح التحول هذا الأسبوع: <b className="code-ltr">{toArabicDigits(result.clarityIndex)}</b> من {toArabicDigits(100)} على {toArabicDigits(result.sample)} ردًا.
            </p>
          ) : (
            <p className="text-body text-muted">{STRINGS.smallSample}</p>
          )}
          <p className="text-secondary text-muted">ما تراه هنا هو ما تراه الإدارة — لا نسخة أخرى.</p>
        </section>
      )}

      {error ? <ErrorState text={error} /> : null}

      <section aria-labelledby="trend" className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
        <h2 id="trend" className="text-card-title font-bold text-ink">
          الاتجاه
        </h2>
        {history.length === 0 ? (
          <p className="text-secondary text-muted">لا أسابيع سابقة بعد.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {history.map((w) => (
              <li key={w.week} className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-3 text-secondary">
                  <span className="text-ink-soft">{weekLabel(w.week)}</span>
                  <span className="code-ltr text-muted">
                    {w.clarityIndex === null ? "—" : toArabicDigits(w.clarityIndex)}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-tag bg-panel-2">
                  <div
                    className="h-full rounded-tag bg-hh-2736"
                    style={{ inlineSize: `${((w.clarityIndex ?? 0) / max) * 100}%` }}
                  />
                </div>
                <span className="text-tag text-faint">{toArabicDigits(w.sample)} ردًا</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
