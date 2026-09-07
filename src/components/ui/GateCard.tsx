"use client";

import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconName } from "./Icon";
import { ICONS } from "@/lib/tokens";
import { cn } from "@/lib/cn";

type GateCardProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  title: string;
  hint?: string;
  icon: IconName;
  /** حالة العرض فقط — تُستخدم في معرض المكوّنات لإظهار شكل الضغط. */
  pressed?: boolean;
  /** حين تكون البطاقة داخل رابط: تُرسم كعنصر عادي لا كزر. */
  asChild?: boolean;
};

/**
 * بطاقة بوابة — الشاشة الأولى.
 * أربع بوابات بأربعة أشكال ولون واحد: الشكل يميّز، واللون محجوز للحالة.
 */
export function GateCard({ title, hint, icon, pressed = false, asChild = false, className, ...rest }: GateCardProps) {
  const Tag = (asChild ? "span" : "button") as "button";
  return (
    <Tag
      {...(asChild ? {} : { type: "button" as const })}
      data-pressed={pressed ? "true" : undefined}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-card border border-line bg-panel p-4 text-start",
        "text-ink transition-colors duration-[120ms] ease-brand",
        "hover:bg-panel-2 active:bg-tint data-[pressed=true]:bg-tint data-[pressed=true]:border-line-strong",
        className,
      )}
      {...(asChild ? {} : rest)}
    >
      <span
        className="inline-flex shrink-0 items-center justify-center rounded-icon bg-tint text-hh-2736"
        style={{ inlineSize: ICONS.containerSize, blockSize: ICONS.containerSize }}
      >
        <Icon name={icon} size={ICONS.sizeInCard} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-card-title font-bold text-ink">{title}</span>
        {hint ? <span className="text-secondary text-muted">{hint}</span> : null}
      </span>
    </Tag>
  );
}
