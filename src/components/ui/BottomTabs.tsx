"use client";

import { Icon, type IconName } from "./Icon";
import { ICONS } from "@/lib/tokens";
import { cn } from "@/lib/cn";

export type TabKey = "home" | "issues" | "knowledge" | "track";

type Tab = { key: TabKey; label: string; icon: IconName };

/** أربعة عناصر ثابتة — لا قائمة جانبية ولا عنصر خامس. */
export const TABS: readonly Tab[] = [
  { key: "home", label: "الرئيسية", icon: "home" },
  { key: "issues", label: "القضايا", icon: "issues" },
  { key: "knowledge", label: "المعرفة", icon: "knowledge" },
  { key: "track", label: "متابعتي", icon: "track" },
];

type BottomTabsProps = {
  active: TabKey;
  onChange?: (key: TabKey) => void;
};

export function BottomTabs({ active, onChange }: BottomTabsProps) {
  return (
    <nav
      aria-label="التنقل الرئيسي"
      className="flex items-stretch justify-around border-t border-line bg-panel"
    >
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onChange?.(tab.key)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 px-2 py-2",
              "transition-colors duration-[120ms] ease-brand",
              // العنصر النشط بلون ونص معًا — لا باللون وحده
              isActive ? "font-bold text-hh-2736" : "text-muted hover:text-ink-soft",
            )}
          >
            <Icon name={tab.icon} size={ICONS.sizeInTabs} />
            <span className="text-tag">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
