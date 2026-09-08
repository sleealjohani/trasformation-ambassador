import type { SVGProps } from "react";
import { ICONS } from "@/lib/tokens";

/**
 * نظام أيقونات واحد: شبكة ٢٤ · سماكة ١٫٦ ثابتة · أطراف مستديرة ·
 * أحادي اللون يرث currentColor. التمييز بالشكل لا باللون.
 */
const PATHS = {
  // البوابات الأربع + الشائعة — أربعة أشكال ولون واحد
  question: "M9 9a3 3 0 1 1 3 3v2.2M12 17.6v.4M4 12a8 8 0 1 0 16 0 8 8 0 0 0-16 0",
  concern: "M12 3.5 5 6.2v5.3c0 4 2.9 7.3 7 9 4.1-1.7 7-5 7-9V6.2Z M12 9v3.4M12 15.4v.3",
  challenge: "M3 19h18M6 19v-5.5l4-3.5 4 3.5V19M14 19v-9l4-3.5V19",
  idea: "M9.2 17h5.6M10 20h4M12 3a6 6 0 0 0-3.6 10.8V16h7.2v-2.2A6 6 0 0 0 12 3Z",
  rumor: "M20 12.5c0 3.6-3.6 6.5-8 6.5-1 0-2-.15-2.9-.42L4 20.5l1.3-3.4A6.6 6.6 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5ZM9 12h.01M12 12h.01M15 12h.01",

  // الحالات الست — لكل حالة شكل مختلف
  dot: "M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7",
  eye: "M2.6 12S6 6.4 12 6.4 21.4 12 21.4 12 18 17.6 12 17.6 2.6 12 2.6 12Z M12 14.4a2.4 2.4 0 1 0 0-4.8 2.4 2.4 0 0 0 0 4.8",
  forward: "M4 12h13M12.5 6.5 18 12l-5.5 5.5M20 5v14",
  clock: "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM12 7.6V12l3 1.8",
  check: "M4 12.6 9 17.6 20 6.6",
  escalate: "M12 20V5M6.5 10.5 12 5l5.5 5.5",

  // الشريط السفلي
  home: "M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z M9.5 20v-5.5h5V20",
  issues: "M4 7h16M4 12h16M4 17h10",
  knowledge: "M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5Z M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5Z",
  track: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM16 16l4 4",

  // أفعال
  send: "M20 4 3.5 10.6l6.6 2.8M20 4l-2.9 16-7-6.6M20 4l-9.9 9.4",
  retry: "M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4",
  close: "M6 6l12 12M18 6 6 18",
  plus: "M12 5v14M5 12h14",
  vote: "M12 19V7M6.5 12.5 12 7l5.5 5.5",
  merge: "M7 20V9a4 4 0 0 1 4-4h6M14 8l3-3-3-3",
  chevronDown: "M6 9.5 12 15.5 18 9.5",
  drag: "M8 9h8M8 15h8",
  lock: "M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1h-13a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1ZM12 15v2",
  journey: "M5 19c0-3 3-3.5 5-4.5S15 12 15 9a3 3 0 0 0-6 0M5 19h14M18 5.5v3M16.5 7h3",
  pulse: "M3 12h3.5l2-5.5 3 11 2.5-7 1.5 3.5H21",
  copy: "M9 9V5.6a1 1 0 0 1 1-1h8.4a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H15M5.6 9h8.8a1 1 0 0 1 1 1v8.4a1 1 0 0 1-1 1H5.6a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1Z",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.9 2.9M14.8 14.8l2.9 2.9M17.7 6.3l-2.9 2.9M9.2 14.8l-2.9 2.9",
} as const;

export type IconName = keyof typeof PATHS;

/** الأيقونات الاتجاهية تُعكس مع اتجاه القراءة؛ غيرها لا يُعكس. */
const DIRECTIONAL: ReadonlySet<IconName> = new Set<IconName>(["forward", "send", "merge", "journey"]);

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & {
  name: IconName;
  size?: number;
  title?: string;
};

export function Icon({ name, size = ICONS.sizeInCard, title, ...rest }: IconProps) {
  return (
    <svg
      data-icon
      data-directional={DIRECTIONAL.has(name) ? "true" : "false"}
      viewBox={`0 0 ${ICONS.grid} ${ICONS.grid}`}
      width={size}
      height={size}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <path d={PATHS[name]} />
    </svg>
  );
}

/** حاوية الأيقونة: ٣٠×٣٠ باستدارة ٩px وخلفية tint */
export function IconBadge({ name, size = ICONS.sizeInCard }: { name: IconName; size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-icon bg-tint text-hh-2736"
      style={{ inlineSize: ICONS.containerSize, blockSize: ICONS.containerSize }}
    >
      <Icon name={name} size={size} />
    </span>
  );
}
