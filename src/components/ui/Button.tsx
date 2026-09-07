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
        "inline-flex items-center justify-center gap-2 rounded-button px-4 py-3 text-body",
        "transition-colors duration-[120ms] ease-brand disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-hh-2736 font-bold text-panel hover:bg-hh-072",
        variant === "secondary" && "border border-line bg-panel text-hh-2736 hover:bg-panel-2",
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
