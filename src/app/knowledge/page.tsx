import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/States";
import { listKnowledge, type KnowledgeKind } from "@/server/knowledge";
import { toArabicDigits } from "@/lib/numerals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "جسر المعرفة — جسر التحول", robots: { index: false } };

const TABS: ReadonlyArray<{ kind: KnowledgeKind; label: string }> = [
  { kind: "known", label: "نعرف" },
  { kind: "unclear", label: "لم يتضح" },
  { kind: "changed", label: "ما الذي تغيّر" },
];

function formatDate(iso: string): string {
  return toArabicDigits(new Intl.DateTimeFormat("ar-SA-u-nu-latn", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso)));
}

export default async function KnowledgePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const raw = (await searchParams).tab;
  const kind: KnowledgeKind = raw === "unclear" || raw === "changed" ? raw : "known";
  const cards = await listKnowledge(kind);

  return (
    <AppShell title="جسر المعرفة" subtitle="ما نعرفه، وما لم يتضح بعد، وما الذي تغيّر — بمصدر وتاريخ لكل بطاقة.">
      <nav aria-label="تبويبات المعرفة" className="flex gap-2 overflow-x-auto">
        {TABS.map((tab) => (
          <Link
            key={tab.kind}
            href={{ pathname: "/knowledge", query: { tab: tab.kind } }}
            aria-current={tab.kind === kind ? "page" : undefined}
            className={
              tab.kind === kind
                ? "inline-flex min-h-11 shrink-0 items-center rounded-tag border border-hh-2736 bg-tint px-4 text-secondary font-bold text-hh-2736"
                : "inline-flex min-h-11 shrink-0 items-center rounded-tag border border-line bg-panel px-4 text-secondary text-ink-soft hover:bg-panel-2"
            }
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {cards.length === 0 ? (
        <EmptyState icon="knowledge" text="لا بطاقات في هذا التبويب بعد." />
      ) : (
        <ul className="flex flex-col gap-3">
          {cards.map((card) => (
            <li key={card.id} className="flex flex-col gap-2 rounded-card border border-line bg-panel p-4">
              <h2 className="text-card-title font-bold text-ink">{card.title}</h2>
              {card.previousBody ? (
                <>
                  <p className="rounded-button border border-line bg-panel-2 p-3 text-secondary text-muted line-through">{card.previousBody}</p>
                  <p className="flex items-center gap-2 text-secondary text-hh-2736">
                    <Icon name="forward" size={14} />
                    <span>صار الآن</span>
                  </p>
                </>
              ) : null}
              <p className="text-body text-ink">{card.body}</p>
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-2 text-secondary text-muted">
                <span>المصدر: {card.source}</span>
                <span>{formatDate(card.date)}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
