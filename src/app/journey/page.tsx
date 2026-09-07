import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { Icon } from "@/components/ui/Icon";
import { EmptyState } from "@/components/ui/States";
import { listJourney } from "@/server/journey";
import { toArabicDigits } from "@/lib/numerals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "رحلة التحول — جسر التحول", robots: { index: false } };

const STATE_LABEL = { done: "مكتملة", current: "نحن هنا الآن", upcoming: "قادمة" } as const;

export default async function JourneyPage() {
  const stages = await listJourney();

  return (
    <AppShell title="رحلة التحول" subtitle="أين نحن الآن، وماذا يحدث في كل مرحلة. لا تاريخ غير رسمي.">
      {stages.length === 0 ? (
        <EmptyState icon="forward" text="لم تُنشر مراحل الرحلة بعد." />
      ) : (
        <ol className="flex flex-col gap-3">
          {stages.map((stage) => (
            <li
              key={stage.id}
              aria-current={stage.state === "current" ? "step" : undefined}
              className={
                stage.state === "current"
                  ? "flex flex-col gap-3 rounded-card border-2 border-hh-2736 bg-panel p-4"
                  : "flex flex-col gap-3 rounded-card border border-line bg-panel p-4"
              }
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-card-title font-bold text-ink">
                  <span className="code-ltr text-secondary text-muted">{toArabicDigits(stage.sort)}</span>
                  <span>{stage.title}</span>
                </h2>
                <span
                  className={
                    stage.state === "done"
                      ? "inline-flex items-center gap-2 rounded-tag border border-status-answered bg-status-answered-tint px-3 py-1 text-tag text-status-answered"
                      : stage.state === "current"
                        ? "inline-flex items-center gap-2 rounded-tag border border-hh-2736 bg-tint px-3 py-1 text-tag font-bold text-hh-2736"
                        : "inline-flex items-center gap-2 rounded-tag border border-status-new bg-status-new-tint px-3 py-1 text-tag text-status-new"
                  }
                >
                  <Icon name={stage.state === "done" ? "check" : stage.state === "current" ? "dot" : "clock"} size={14} />
                  <span>{STATE_LABEL[stage.state]}</span>
                </span>
              </div>

              <p className="text-body text-ink">{stage.whatHappens}</p>
              <p className="rounded-button border border-line bg-panel-2 p-3 text-secondary text-ink-soft">
                <span className="font-bold">ماذا يحتاج منك: </span>
                {stage.employeeAction}
              </p>
              {stage.openQuestions.length > 0 ? (
                <div className="border-t border-line pt-2">
                  <p className="text-secondary font-bold text-ink-soft">أسئلة ما زالت مفتوحة</p>
                  <ul className="mt-1 flex flex-col gap-1">
                    {stage.openQuestions.map((q) => (
                      <li key={q} className="flex items-center gap-2 text-secondary text-muted">
                        <Icon name="clock" size={14} />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      )}
    </AppShell>
  );
}
