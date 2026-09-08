import { Icon, type IconName } from "./Icon";
import { STATUS_COLORS, type StatusKey } from "@/lib/tokens";
import { STRINGS } from "@/content/strings";
import { cn } from "@/lib/cn";

/** لكل حالة شكل خاص — الحالة تُنقل بلون + رمز + نص، لا بلون وحده. */
const STATUS_ICON: Record<StatusKey, IconName> = {
  new: "dot",
  reviewed: "eye",
  referred: "forward",
  waiting: "clock",
  answered: "check",
  escalated: "escalate",
};

type StatusTagProps = {
  status: StatusKey;
  /** نص بديل للحالة عند الحاجة إلى صياغة أدق في سياق معيّن. */
  label?: string;
  className?: string;
};

export function StatusTag({ status, label, className }: StatusTagProps) {
  const color = STATUS_COLORS[status];
  const text = label ?? STRINGS.statusLabels[status];

  return (
    <span
      data-status={status}
      className={cn(
        "fade-in inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-tag border px-3 py-1 text-tag",
        className,
      )}
      style={{ color: color.fg, backgroundColor: color.tint, borderColor: color.fg }}
    >
      <Icon name={STATUS_ICON[status]} size={14} />
      <span>{text}</span>
    </span>
  );
}
