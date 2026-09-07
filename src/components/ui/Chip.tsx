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
        "inline-flex items-center rounded-tag border px-4 py-2 text-secondary",
        "transition-colors duration-[120ms] ease-brand",
        selected
          ? "border-hh-2736 bg-tint font-bold text-hh-2736"
          : "border-line bg-panel text-ink-soft hover:bg-panel-2",
        disabled && "cursor-not-allowed border-line bg-panel-2 text-faint hover:bg-panel-2",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
