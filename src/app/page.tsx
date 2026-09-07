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

export default async function HomePage() {
  const [issues, unclear] = await Promise.all([listIssues({ limit: 3 }), countUnclear()]);

  return (
    <AppShell title={STRINGS.appName} subtitle={STRINGS.promise} hero>
      <section aria-labelledby="gates" className="flex flex-col gap-3">
        <h2 id="gates" className="text-card-title font-bold text-ink">
          بماذا نبدأ؟
        </h2>
        {GATES.map((g) => (
          <Link key={g.gate} href={{ pathname: "/ask", query: { gate: g.gate } }} className="contents">
            <GateCard icon={g.icon} title={g.title} hint={g.hint} asChild />
          </Link>
        ))}
        <Link
          href="/rumors"
          className="flex min-h-11 items-center gap-3 rounded-card border border-line bg-panel p-4 text-start transition-colors duration-[120ms] ease-brand hover:bg-panel-2"
        >
          <span className="inline-flex size-[30px] shrink-0 items-center justify-center rounded-icon bg-tint text-hh-2736">
            <Icon name="rumor" size={16} />
          </span>
          <span className="flex flex-col">
            <span className="text-card-title font-bold text-ink">{STRINGS.gateTitles.rumor}</span>
            <span className="text-secondary text-muted">{STRINGS.gateOpeners.rumor}</span>
          </span>
        </Link>
      </section>

      <section aria-labelledby="live" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <h2 id="live" className="text-card-title font-bold text-ink">
            القضايا الحيّة
          </h2>
          <Link href="/issues" className="inline-flex min-h-11 items-center text-secondary text-hh-2736 hover:underline">
            الكل
          </Link>
        </div>
        {issues.length === 0 ? (
          <EmptyState text={STRINGS.emptyIssues} />
        ) : (
          <ul className="flex flex-col gap-2">
            {issues.map((issue) => (
              <li key={issue.id}>
                <Link
                  href="/issues"
                  className="flex min-h-11 items-center justify-between gap-3 rounded-card border border-line bg-panel p-4 hover:bg-panel-2"
                >
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="text-body font-bold text-ink">{issue.title}</span>
                    <span className="text-secondary text-muted">
                      {issue.topicLabel} · {toArabicDigits(issue.weight)} مهتمًا
                    </span>
                  </span>
                  <StatusTag status={issue.status === "answered" ? "answered" : issue.status === "referred" ? "referred" : issue.status === "waiting" ? "waiting" : "new"} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4">
        <h2 className="text-card-title font-bold text-ink">بطاقة سفير التغيير</h2>
        <p className="text-secondary text-ink-soft">
          يستقبل سفير التغيير في المنشأة كل مشاركة، ويحيل ما يحتاج قرارًا إلى فريق التحول، ثم تُنشر الإجابة هنا.
        </p>
        <p className="text-secondary text-muted">{STRINGS.privacyNotice}</p>
        <div className="flex flex-wrap gap-2">
          <Link href="/knowledge" className="inline-flex min-h-11 items-center gap-2 rounded-button border border-line px-4 text-secondary text-hh-2736 hover:bg-panel-2">
            <Icon name="knowledge" size={16} />
            <span>جسر المعرفة{unclear > 0 ? ` · ${toArabicDigits(unclear)} لم تتضح` : ""}</span>
          </Link>
          <Link href="/journey" className="inline-flex min-h-11 items-center gap-2 rounded-button border border-line px-4 text-secondary text-hh-2736 hover:bg-panel-2">
            <Icon name="forward" size={16} />
            <span>رحلة التحول</span>
          </Link>
          <Link href="/pulse" className="inline-flex min-h-11 items-center gap-2 rounded-button border border-line px-4 text-secondary text-hh-2736 hover:bg-panel-2">
            <Icon name="vote" size={16} />
            <span>نبض التحول</span>
          </Link>
          <Link href="/answers" className="inline-flex min-h-11 items-center gap-2 rounded-button border border-line px-4 text-secondary text-hh-2736 hover:bg-panel-2">
            <Icon name="check" size={16} />
            <span>الإجابات</span>
          </Link>
        </div>
      </section>
    </AppShell>
  );
}
