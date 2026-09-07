"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon, type IconName } from "@/components/ui/Icon";
import { EmptyState, ErrorState } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";
import { apiSend, errorMessage } from "@/lib/api";
import { toArabicDigits } from "@/lib/numerals";
import { redact } from "@/lib/redact";

export type RumorItem = {
  id: string;
  claim: string;
  count: number;
  verdict: "waiting" | "false" | "true" | "partly";
  officialText: string | null;
};

/** أربع حالات لا خامس لها — لكل واحدة لون + رمز + نص */
const VERDICT: Record<RumorItem["verdict"], { label: string; icon: IconName; fg: string; tint: string }> = {
  waiting: { label: "بانتظار توضيح رسمي", icon: "clock", fg: "var(--color-status-waiting)", tint: "var(--color-status-waiting-tint)" },
  false: { label: "غير صحيح", icon: "escalate", fg: "var(--color-status-escalated)", tint: "var(--color-status-escalated-tint)" },
  true: { label: "صحيح", icon: "check", fg: "var(--color-status-answered)", tint: "var(--color-status-answered-tint)" },
  partly: { label: "صحيح جزئيًا", icon: "eye", fg: "var(--color-status-reviewed)", tint: "var(--color-status-reviewed-tint)" },
};

export function RumorsPanel({ items }: { items: RumorItem[] }) {
  const [claim, setClaim] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function report() {
    setBusy(true);
    setError(null);
    try {
      // التنقية على الجهاز أولًا
      await apiSend<{ received: true }>("/api/rumors", { claim: redact(claim).clean });
      setSent(true);
      setClaim("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="رصد شائعة" className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
        <label htmlFor="claim" className="text-card-title font-bold text-ink">
          {STRINGS.gateOpeners.rumor}
        </label>
        <textarea
          id="claim"
          value={claim}
          onChange={(e) => setClaim(e.target.value)}
          rows={3}
          maxLength={1000}
          className="w-full rounded-card border border-line bg-panel-2 p-3 text-body text-ink outline-none focus-visible:border-hh-2736"
          placeholder="اكتب ما سمعته…"
        />
        <Button onClick={() => void report()} disabled={busy || claim.trim().length < 5}>
          <Icon name="send" size={16} />
          <span>{busy ? "جارٍ الإرسال…" : "أرسل ما سمعته"}</span>
        </Button>
        {sent ? (
          <p role="status" className="rounded-button border border-status-answered bg-status-answered-tint p-3 text-secondary text-status-answered">
            وصلتنا. لا يُنشر أي موقف قبل اعتماده رسميًا.
          </p>
        ) : null}
        {error ? <ErrorState text={error} onRetry={() => void report()} /> : null}
        <p className="text-secondary text-muted">{STRINGS.privacyNotice}</p>
      </section>

      <section aria-labelledby="board" className="flex flex-col gap-3">
        <h2 id="board" className="text-card-title font-bold text-ink">
          لوح المواقف الرسمية
        </h2>
        {items.length === 0 ? (
          <EmptyState icon="rumor" text="لا موقف معتمد للنشر بعد." />
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => {
              const v = VERDICT[item.verdict];
              return (
                <li key={item.id} className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
                  <p className="text-card-title font-bold text-ink">«{item.claim}»</p>
                  <span
                    className="inline-flex w-fit items-center gap-2 rounded-tag border px-3 py-1 text-tag"
                    style={{ color: v.fg, backgroundColor: v.tint, borderColor: v.fg }}
                  >
                    <Icon name={v.icon} size={14} />
                    <span>{v.label}</span>
                  </span>
                  <p className="text-body text-ink">{item.officialText ?? STRINGS.noOfficialInfo}</p>
                  <p className="border-t border-line pt-2 text-secondary text-muted">وردت {toArabicDigits(item.count)} مرة</p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
