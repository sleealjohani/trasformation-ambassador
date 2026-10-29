"use client";

import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  full?: boolean;
};

/** الأفعال على 2736C — الأزرقان الأساسيان للأسطح لا للنص. */
export function Button({ variant = "primary", full = false, className, children, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative inline-flex min-h-11 items-center justify-center gap-2 rounded-button px-4 py-3 text-body",
        "transition-all duration-[180ms] ease-brand active:scale-[0.98]",
        // التعطيل بتعبئة ونص مخصّصين لا بـopacity: خفض شفافية الحاوية يخفض النص معها
        "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-disabled-ink",
        "disabled:border-transparent disabled:shadow-none disabled:active:scale-100",
        variant === "primary" &&
          "bg-primary font-bold text-inverse shadow-[0_8px_24px_-12px_rgb(5_117_144_/_0.55)] hover:bg-primary-hover active:bg-primary-active",
        variant === "secondary" && "border border-control-border bg-panel text-primary hover:border-primary hover:bg-tint",
        variant === "ghost" && "text-primary hover:bg-tint",
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
