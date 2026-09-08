"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { ICONS } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export type TabKey = "home" | "issues" | "knowledge" | "track";

type Tab = { key: TabKey; label: string; icon: IconName; href: string };

/** أربعة عناصر ثابتة — لا قائمة جانبية ولا عنصر خامس. */
export const TABS: readonly Tab[] = [
  { key: "home", label: "الرئيسية", icon: "home", href: "/" },
  { key: "issues", label: "القضايا", icon: "issues", href: "/issues" },
  { key: "knowledge", label: "المعرفة", icon: "knowledge", href: "/knowledge" },
  { key: "track", label: "متابعتي", icon: "track", href: "/track" },
];

export function tabForPath(pathname: string): TabKey {
  if (pathname.startsWith("/issues") || pathname.startsWith("/answers") || pathname.startsWith("/rumors")) return "issues";
  if (pathname.startsWith("/knowledge") || pathname.startsWith("/journey") || pathname.startsWith("/pulse")) return "knowledge";
  if (pathname.startsWith("/track")) return "track";
  return "home";
}

export function BottomTabs({ active }: { active?: TabKey }) {
  const pathname = usePathname();
  const current = active ?? tabForPath(pathname);
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ start: number; width: number } | null>(null);

  // المؤشّر ينزلق إلى التبويب النشط بدل أن يقفز
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const move = () => {
      const item = nav.querySelector<HTMLElement>(`[data-tab="${current}"]`);
      if (!item) return;
      const navBox = nav.getBoundingClientRect();
      const box = item.getBoundingClientRect();
      const rtl = getComputedStyle(nav).direction === "rtl";
      const start = rtl ? navBox.right - box.right : box.left - navBox.left;
      setIndicator({ start: start + box.width * 0.3, width: box.width * 0.4 });
    };
    move();
    window.addEventListener("resize", move);
    return () => window.removeEventListener("resize", move);
  }, [current]);

  return (
    <nav
      ref={navRef}
      aria-label="التنقل الرئيسي"
      className="relative flex items-stretch justify-around border-t border-line bg-panel/95 backdrop-blur-md"
    >
      {indicator ? (
        <span
          aria-hidden
          className="tab-indicator"
          style={{ insetInlineStart: `${indicator.start}px`, inlineSize: `${indicator.width}px` }}
        />
      ) : null}

      {TABS.map((tab) => {
        const isActive = tab.key === current;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            data-tab={tab.key}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 py-2",
              "transition-colors duration-[160ms] ease-brand",
              // العنصر النشط بلون ونص معًا — لا باللون وحده
              isActive ? "font-bold text-hh-2736" : "text-muted hover:text-ink-soft",
            )}
          >
            <span
              className={cn(
                "transition-transform duration-[260ms] ease-brand",
                isActive ? "-translate-y-0.5 scale-110" : "group-hover:-translate-y-0.5",
              )}
            >
              <Icon name={tab.icon} size={ICONS.sizeInTabs} />
            </span>
            <span className="text-tag">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
