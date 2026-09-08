import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { GateCard } from "@/components/ui/GateCard";
import { Icon } from "@/components/ui/Icon";
import { StatusTag } from "@/components/ui/StatusTag";
import { EmptyState } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";
import { toArabicDigits } from "@/lib/numerals";
import { listIssues } from "@/server/issues";
import { countUnclear } from "@/server/knowledge";

export const dynamic = "force-dynamic";

const GATES = [
  { gate: "question", icon: "question" as const, title: STRINGS.gateTitles.question, hint: STRINGS.gateOpeners.question },
  { gate: "concern", icon: "concern" as const, title: STRINGS.gateTitles.concern, hint: STRINGS.gateOpeners.concern },
  { gate: "challenge", icon: "challenge" as const, title: STRINGS.gateTitles.challenge, hint: STRINGS.gateOpeners.challenge },
  { gate: "idea", icon: "idea" as const, title: STRINGS.gateTitles.idea, hint: STRINGS.gateOpeners.idea },
];

const SHORTCUTS = [
  { href: "/knowledge", icon: "knowledge" as const, label: "جسر المعرفة" },
  { href: "/journey", icon: "journey" as const, label: "رحلة التحول" },
  { href: "/pulse", icon: "pulse" as const, label: "نبض التحول" },
  { href: "/answers", icon: "check" as const, label: "الإجابات" },
];

export default async function HomePage() {
  const [issues, unclear] = await Promise.all([listIssues({ limit: 3 }), countUnclear()]);

  return (
    <AppShell title={STRINGS.appName} subtitle={STRINGS.promise} hero ask={false}>
      {/* الفعل الرئيسي أولًا: لا يحتاج الموظف أن يبحث كيف يوصل صوته */}
      <section aria-labelledby="gates" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="gates" className="text-card-title font-bold text-ink">
            بماذا نبدأ؟
          </h2>
          <span className="text-tag text-faint">مجهول تمامًا</span>
        </div>

        {GATES.map((g, i) => (
          <Link key={g.gate} href={{ pathname: "/ask", query: { gate: g.gate } }} className="contents">
            <GateCard icon={g.icon} title={g.title} hint={g.hint} asChild style={{ "--i": i } as React.CSSProperties} />
          </Link>
        ))}

        <Link
          href="/rumors"
          className="lift draw group surface-raise flex min-h-11 items-center gap-3 rounded-card p-4 text-start"
          style={{ "--i": 4 } as React.CSSProperties}
        >
          <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-icon bg-tint text-hh-2736 transition-transform duration-[260ms] ease-brand group-hover:scale-110">
            <Icon name="rumor" size={16} />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-card-title font-bold text-ink">{STRINGS.gateTitles.rumor}</span>
            <span className="text-secondary text-muted">{STRINGS.gateOpeners.rumor}</span>
          </span>
          <span aria-hidden className="shrink-0 text-line-strong transition-all duration-[260ms] ease-brand group-hover:-translate-x-1 group-hover:text-hh-2736">
            <Icon name="forward" size={18} />
          </span>
        </Link>
      </section>

      <section aria-labelledby="live" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="live" className="text-card-title font-bold text-ink">
            القضايا الحيّة
          </h2>
          <Link href="/issues" className="inline-flex min-h-11 items-center gap-1 text-secondary text-hh-2736 hover:underline">
            <span>الكل</span>
            <Icon name="forward" size={14} />
          </Link>
        </div>
        {issues.length === 0 ? (
          <EmptyState text={STRINGS.emptyIssues} />
        ) : (
          <ul className="flex flex-col gap-2">
            {issues.map((issue, i) => (
              <li key={issue.id}>
                <Link
                  href="/issues"
                  className="lift surface-raise flex min-h-11 items-center justify-between gap-3 rounded-card p-4"
                  style={{ "--i": i } as React.CSSProperties}
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-body font-bold text-ink">{issue.title}</span>
                    <span className="text-secondary text-muted">
                      {issue.topicLabel} · {toArabicDigits(issue.weight)} مهتمًا
                    </span>
                  </span>
                  <StatusTag
                    status={
                      issue.status === "answered"
                        ? "answered"
                        : issue.status === "referred"
                          ? "referred"
                          : issue.status === "waiting"
                            ? "waiting"
                            : "new"
                    }
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="explore" className="flex flex-col gap-3">
        <h2 id="explore" className="text-card-title font-bold text-ink">
          تصفّح
        </h2>
        <ul className="grid grid-cols-2 gap-3">
          {SHORTCUTS.map((s, i) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="lift draw group surface-raise flex min-h-11 flex-col gap-2 rounded-card p-4 text-hh-2736"
                style={{ "--i": i } as React.CSSProperties}
              >
                <span className="inline-flex size-[30px] items-center justify-center rounded-icon bg-tint transition-transform duration-[260ms] ease-brand group-hover:scale-110">
                  <Icon name={s.icon} size={16} />
                </span>
                <span className="text-secondary font-bold text-ink">{s.label}</span>
                {s.href === "/knowledge" && unclear > 0 ? (
                  <span className="text-tag text-muted">{toArabicDigits(unclear)} لم تتضح بعد</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-raise flex flex-col gap-3 rounded-card p-4">
        <h2 className="flex items-center gap-2 text-card-title font-bold text-ink">
          <Icon name="spark" size={16} />
          <span>كيف تعمل القناة؟</span>
        </h2>
        <ol className="flex flex-col gap-3">
          {[
            "تكتب ما يشغلك بلا اسم ولا رقم وظيفي.",
            "ننقّي النص من أي معلومة قد تدلّ عليك، ثم يصل لسفير التغيير.",
            "يحيله إلى فريق التحول، وتتابع الحالة برمزك حتى تُنشر الإجابة.",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-secondary text-ink-soft">
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-tag bg-tint text-tag font-bold text-hh-2736">
                {toArabicDigits(i + 1)}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>
    </AppShell>
  );
}
