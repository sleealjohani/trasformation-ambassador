"use client";

import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

type ChatBubbleProps = {
  /** واردة: رسالة النظام · صادرة: ما كتبه الموظف */
  side: "incoming" | "outgoing";
  children?: React.ReactNode;
  /** جارٍ الكتابة — يستبدل المحتوى بثلاث نقاط متحركة */
  typing?: boolean;
  /** فشل الإرسال — يُظهر إعادة المحاولة */
  failed?: boolean;
  onRetry?: () => void;
};

export function ChatBubble({ side, children, typing = false, failed = false, onRetry }: ChatBubbleProps) {
  const isOutgoing = side === "outgoing";

  return (
    <div className={cn("rise flex flex-col gap-1", isOutgoing ? "items-end" : "items-start")}>
      <div
        data-side={side}
        data-typing={typing ? "true" : undefined}
        data-failed={failed ? "true" : undefined}
        className={cn(
          "max-w-[80%] rounded-card px-4 py-3 text-body shadow-[0_2px_10px_-6px_rgb(15_42_68_/_0.3)]",
          isOutgoing
            ? "bg-hh-2736 text-panel rounded-ee-xs"
            : "border border-line bg-panel text-ink rounded-es-xs",
          failed && "border-hh-072 bg-status-escalated-tint text-hh-072",
        )}
      >
        {typing ? (
          <span className="flex items-center gap-1" role="status" aria-label="جارٍ الكتابة">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block size-1.5 rounded-tag bg-current opacity-40 motion-safe:animate-pulse"
                style={{ animationDelay: `${i * 160}ms` }}
              />
            ))}
          </span>
        ) : (
          children
        )}
      </div>

      {failed ? (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-2 text-secondary text-hh-2736 underline-offset-4 hover:underline"
        >
          <Icon name="retry" size={14} />
          <span>لم تُرسل — إعادة المحاولة</span>
        </button>
      ) : null}
    </div>
  );
}
