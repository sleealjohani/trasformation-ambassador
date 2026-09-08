"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon, type IconName } from "./Icon";
import { ICONS } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export type TabKey = "home" | "share" | "pulse" | "videos" | "track";
type Tab = { key: TabKey; label: string; icon: IconName; href: string };

export const TABS: readonly Tab[] = [
  { key: "home", label: "الرئيسية", icon: "home", href: "/" },
  { key: "share", label: "شارك", icon: "plus", href: "/share" },
  { key: "pulse", label: "استطلاع", icon: "pulse", href: "/pulse" },
  { key: "videos", label: "مختصرات", icon: "video", href: "/videos" },
  { key: "track", label: "متابعتي", icon: "track", href: "/track" },
];

export function tabForPath(pathname: string): TabKey {
  if (pathname.startsWith("/share") || pathname.startsWith("/ask") || pathname.startsWith("/rumors")) return "share";
  if (pathname.startsWith("/pulse")) return "pulse";
  if (pathname.startsWith("/videos")) return "videos";
  if (pathname.startsWith("/track")) return "track";
  return "home";
}

export function BottomTabs({ active }: { active?: TabKey }) {
  const pathname = usePathname();
  const current = active ?? tabForPath(pathname);
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState<{ start: number; width: number } | null>(null);

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
      setIndicator({ start: start + box.width * 0.28, width: box.width * 0.44 });
    };
    move();
    window.addEventListener("resize", move);
    return () => window.removeEventListener("resize", move);
  }, [current]);

  return (
    <nav ref={navRef} aria-label="التنقل الرئيسي" className="v2-bottom-nav relative flex items-stretch justify-around">
      {indicator ? <span aria-hidden className="tab-indicator" style={{ insetInlineStart: `${indicator.start}px`, inlineSize: `${indicator.width}px` }} /> : null}
      {TABS.map((tab) => {
        const isActive = tab.key === current;
        return (
          <Link key={tab.key} href={tab.href} data-tab={tab.key} aria-current={isActive ? "page" : undefined} className={cn("group flex min-h-11 min-w-0 flex-1 flex-col items-center justify-center gap-1 px-1 py-2 transition-colors duration-[160ms] ease-brand", isActive ? "font-bold text-hh-2736" : "text-muted hover:text-ink-soft", tab.key === "share" && "v2-share-tab")}>
            <span className={cn("transition-transform duration-[220ms] ease-brand", isActive ? "-translate-y-0.5 scale-110" : "group-hover:-translate-y-0.5")}>
              <Icon name={tab.icon} size={ICONS.sizeInTabs} />
            </span>
            <span className="text-tag">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
