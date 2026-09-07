"use client";

import { useEffect, useMemo, useState } from "react";
import { useMounted } from "@/lib/client-only";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { STRINGS } from "@/content/strings";
import { toArabicDigits } from "@/lib/numerals";
import { readLocal } from "@/lib/storage";

type LastResult = { refCode: string; topic: string; similarCount: number; mergedIntoIssueId?: string };

/** سقوف SLA كما يراها الموظف */
const SLA_ROWS = [
  { step: "مراجعة وتصنيف", within: "٢٤ ساعة" },
  { step: "إحالة لفريق التحول", within: "٤٨ ساعة" },
  { step: "إجابة رسمية", within: "٧ أيام عمل" },
];

export function DoneCard() {
  const mounted = useMounted();
  if (!mounted) return null;
  return <DoneCardClient />;
}

function DoneCardClient() {
  const router = useRouter();
  const result = useMemo(() => readLocal<LastResult>("bridge:last"), []);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) router.replace("/");
  }, [result, router]);

  if (!result) return null;

  async function copy() {
    try {
      await navigator.clipboard.writeText(result?.refCode ?? "");
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="flex items-center gap-2 rounded-card border border-status-answered bg-status-answered-tint p-4 text-body text-status-answered">
        <Icon name="check" size={22} />
        <span>{STRINGS.submitButtonDone} — وصلت مشاركتك مجهولة المصدر.</span>
      </p>

      <section aria-labelledby="code" className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
        <h2 id="code" className="text-card-title font-bold text-ink">
          رمز المتابعة
        </h2>
        <p data-testid="ref-code" className="code-ltr rounded-button bg-tint px-4 py-3 text-center text-code font-bold tracking-widest text-hh-2736">
          {result.refCode}
        </p>
        <p className="text-secondary text-hh-072">{STRINGS.keepCode}</p>
        <Button variant="secondary" onClick={() => void copy()}>
          <Icon name={copied ? "check" : "plus"} size={16} />
          <span>{copied ? "نُسخ الرمز" : "نسخ الرمز"}</span>
        </Button>
      </section>

      <section aria-labelledby="sla" className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
        <h2 id="sla" className="text-card-title font-bold text-ink">
          ماذا يحدث الآن؟
        </h2>
        <ul className="flex flex-col gap-2">
          {SLA_ROWS.map((row) => (
            <li key={row.step} className="flex items-center justify-between gap-3 border-b border-line pb-2 text-secondary last:border-0 last:pb-0">
              <span className="text-ink-soft">{row.step}</span>
              <span className="text-muted">خلال {row.within}</span>
            </li>
          ))}
        </ul>
        <p className="text-secondary text-muted">
          التصنيف: {result.topic}
          {result.similarCount > 0 ? ` · ${toArabicDigits(result.similarCount)} مشاركة مشابهة وصلت قبلك` : ""}
        </p>
      </section>

      <Link href={{ pathname: "/track", query: { code: result.refCode } }} className="contents">
        <Button full>تابع مشاركتك</Button>
      </Link>
    </div>
  );
}
