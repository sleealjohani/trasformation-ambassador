"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selected?: boolean;
};

/**
 * رقاقة اختيار — أسئلة المتابعة والفلاتر.
 * مقترحة لا مُلزِمة: الموظف يكتب ما يشاء ولا يُجبر على اختيار رقاقة.
 */
export function Chip({ selected = false, disabled, className, children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-11 items-center rounded-tag border px-4 text-note",
        "transition-all duration-[180ms] ease-brand active:scale-95",
        selected
          ? "border-primary bg-tint font-bold text-primary"
          : "border-line bg-panel text-ink-soft hover:border-control-border hover:bg-section",
        disabled && "cursor-not-allowed border-line bg-section text-disabled-ink hover:bg-section",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
