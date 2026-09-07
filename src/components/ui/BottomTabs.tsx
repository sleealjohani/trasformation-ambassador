"use client";

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

  return (
    <nav aria-label="التنقل الرئيسي" className="flex items-stretch justify-around border-t border-line bg-panel">
      {TABS.map((tab) => {
        const isActive = tab.key === current;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-1 px-2 py-2",
              "transition-colors duration-[120ms] ease-brand",
              // العنصر النشط بلون ونص معًا — لا باللون وحده
              isActive ? "font-bold text-hh-2736" : "text-muted hover:text-ink-soft",
            )}
          >
            <Icon name={tab.icon} size={ICONS.sizeInTabs} />
            <span className="text-tag">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
