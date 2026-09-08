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
        "disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        variant === "primary" &&
          "bg-hh-2736 font-bold text-panel shadow-[0_8px_24px_-12px_rgb(21_80_138_/_0.7)] hover:bg-hh-072 hover:shadow-[0_12px_28px_-12px_rgb(21_80_138_/_0.8)]",
        variant === "secondary" && "border border-line bg-panel text-hh-2736 hover:border-hh-2736 hover:bg-tint",
        variant === "ghost" && "text-hh-2736 hover:bg-tint",
        full && "w-full",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
