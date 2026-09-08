/**
 * مصدر واحد لقيم الهوية، تقرأه المكوّنات والاختبارات معًا.
 * كل قيمة هنا مأخوذة من دليل هوية شركة الصحة القابضة — لا لون مبتكر.
 */

/** لوحة الهوية الرسمية: Pantone → HEX */
export const BRAND_PALETTE = {
  "2985C": "#2FA9E0",
  "299C": "#1691D0",
  "2736C": "#15508A",
  "072C": "#283A83",
  "3145C": "#057590",
  "229C": "#1194D2",
  "7479C": "#3AC0C3",
  "802C": "#48AD48",
  "375C": "#9ECC3B",
  "7543C": "#A09EA4",
} as const;

/**
 * الأزرقان الأساسيان لا يحققان تباينًا كافيًا للنص على أبيض،
 * فحُصرا في الأسطح والعناصر الرسومية الكبيرة.
 */
export const NOT_FOR_TEXT_ON_WHITE: readonly string[] = ["#2FA9E0", "#1691D0"];

/** الأسطح والنص والحدود — مشتقّة من اللوحة ومحايدة */
export const SURFACE_TOKENS = {
  bg: "#F2F6FA",
  panel: "#FFFFFF",
  panel2: "#F7FAFC",
  tint: "#E8F2FA",
  line: "#E3E8ED",
  lineStrong: "#C9D8E4",
  ink: "#0F2A44",
  inkSoft: "#2C4E6E",
  muted: "#657F98",
  faint: "#93A9BC",
  night: "#0B2C4E",
  nightDeep: "#071F3A",
  onDark: "#EAF2F8",
} as const;

/** ست حالات، لكل واحدة لون + رمز + نص — ولا تُنقل الحالة باللون وحده. */
export const STATUS_KEYS = [
  "new",
  "reviewed",
  "referred",
  "waiting",
  "answered",
  "escalated",
] as const;

export type StatusKey = (typeof STATUS_KEYS)[number];

export const STATUS_COLORS: Record<StatusKey, { fg: string; tint: string }> = {
  new: { fg: "#A09EA4", tint: "#F0F0F2" },
  reviewed: { fg: "#15508A", tint: "#E8F2FA" },
  referred: { fg: "#1691D0", tint: "#E6F2FB" },
  waiting: { fg: "#057590", tint: "#E6F1F4" },
  answered: { fg: "#2F8A4A", tint: "#E9F4E9" },
  escalated: { fg: "#283A83", tint: "#E8EAF3" },
};

/**
 * كل لون مسموح به في الواجهة. أي قيمة سداسية خارج هذه المجموعة تُعدّ مخالفة،
 * ويمنعها اختبار `tests/palette.test.ts`.
 */
export const ALLOWED_HEX: readonly string[] = [
  ...Object.values(BRAND_PALETTE),
  ...Object.values(SURFACE_TOKENS),
  ...Object.values(STATUS_COLORS).flatMap((c) => [c.fg, c.tint]),
  "#000000",
  "#FFFFFF",
];

/**
 * لوحة الانتقال — تُستعمل في `src/app/intro.css` وحده.
 * مشهد الافتتاح يصوّر علامتين لا علامة واحدة: الأخضر والذهبي لونا وزارة الصحة
 * المنصرفة، وبقية القيم تدرّجات الظهور كما وردت في ملف الحركة المعتمد.
 * لذلك يُستثنى ذلك الملف وحده من قاعدة «لا لون خارج اللوحة».
 */
export const TRANSITION_PALETTE: readonly string[] = [
  "#009b72", "#a69b62", "#d3c88a", "#5fcfd0", "#27c3a4", "#59c8ef",
  "#35c6a7", "#57d6de", "#edf8ff", "#f8ffff", "#79e0db", "#26a9d8",
  "#e9fdff", "#68dbea", "#233f86", "#030708", "#071214", "#07111a",
  "#071a28", "#112f6c", "#1c3d84", "#10285e", "#17336f",
];

/** ملفا مشهد الافتتاح وحدهما مستثنيان من فحص اللوحة. */
export const PALETTE_EXEMPT_FILES: readonly string[] = [
  "src/app/intro.css",
  "src/components/app/Intro.tsx",
];

/** الاستدارة والمسافات والحركة */
export const SHAPE = {
  spacingUnit: 4,
  spacingScale: [4, 8, 12, 16, 24, 32] as const,
  screenPaddingInline: 16,
  screenPaddingBlockStart: 24,
  radiusCard: 12,
  radiusButton: 10,
  radiusIcon: 9,
  radiusTag: 999,
  borderWidth: 1,
  minTouchTarget: 44,
} as const;

export const MOTION = {
  enterMs: 180,
  exitMs: 120,
  easing: "cubic-bezier(0.32, 0.72, 0, 1)",
} as const;

/** نظام الأيقونات: شبكة ٢٤ · سماكة ١٫٦ ثابتة · أحادية ترث currentColor */
export const ICONS = {
  grid: 24,
  strokeWidth: 1.6,
  sizeInCard: 16,
  sizeInTabs: 17,
  sizeInSuccess: 22,
  containerSize: 30,
} as const;
