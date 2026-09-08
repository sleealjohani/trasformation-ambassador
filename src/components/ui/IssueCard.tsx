"use client";

import { Icon } from "./Icon";
import { StatusTag } from "./StatusTag";
import { toArabicDigits } from "@/lib/numerals";
import type { StatusKey } from "@/lib/tokens";
import { cn } from "@/lib/cn";

type IssueCardProps = {
  title: string;
  topic: string;
  status: StatusKey;
  interestedCount: number;
  /** الإجابة الرسمية المعتمدة — إن لم توجد يظهر النص الرسمي للغياب. */
  answer?: string;
  /** مصدر الإجابة إلزامي متى وُجدت إجابة. */
  answerSource?: string;
  /** صوّت الموظف بـ«هذا يشغلني أيضًا» — مرة واحدة لكل جهاز لكل قضية. */
  voted?: boolean;
  /** القضية مُدمجة في قضية أكبر. */
  merged?: boolean;
  mergedIntoTitle?: string;
  onVote?: () => void;
};

export function IssueCard({
  title,
  topic,
  status,
  interestedCount,
  answer,
  answerSource,
  voted = false,
  merged = false,
  mergedIntoTitle,
  onVote,
}: IssueCardProps) {
  return (
    <article
      data-merged={merged ? "true" : undefined}
      className={cn(
        "lift surface-raise flex flex-col gap-3 rounded-card p-4",
        merged && "bg-panel-2",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-card-title font-bold text-ink">{title}</h3>
        <StatusTag status={status} />
      </div>

      <p className="text-secondary text-muted">{topic}</p>

      {merged ? (
        <p className="flex items-center gap-2 text-secondary text-ink-soft">
          <Icon name="merge" size={14} />
          <span>مُدمجة في: {mergedIntoTitle}</span>
        </p>
      ) : null}

      {answer ? (
        <div className="rounded-button border border-line bg-panel-2 p-3">
          <p className="text-body text-ink">{answer}</p>
          {answerSource ? (
            <p className="mt-2 text-secondary text-muted">المصدر: {answerSource}</p>
          ) : null}
        </div>
      ) : (
        <p className="text-secondary text-muted">لم يصدر توضيح رسمي حتى الآن.</p>
      )}

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-secondary text-muted">
          {toArabicDigits(interestedCount)} مهتمًا
        </span>
        <button
          type="button"
          onClick={onVote}
          aria-pressed={voted}
          disabled={voted}
          className={cn(
            "group inline-flex min-h-11 items-center gap-2 rounded-button px-4 text-secondary",
            "transition-all duration-[200ms] ease-brand active:scale-95",
            voted
              ? "cursor-default bg-tint font-bold text-hh-2736"
              : "border border-line text-ink-soft hover:border-hh-2736 hover:bg-tint hover:text-hh-2736",
          )}
        >
          <span className={cn("transition-transform duration-[260ms] ease-brand", voted ? "-translate-y-0.5" : "group-hover:-translate-y-0.5")}>
            <Icon name={voted ? "check" : "vote"} size={14} />
          </span>
          <span>{voted ? "سُجّل اهتمامك" : "هذا يشغلني أيضًا"}</span>
        </button>
      </div>
    </article>
  );
}
