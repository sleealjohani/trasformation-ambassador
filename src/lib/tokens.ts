/**
 * مصدر واحد لقيم الهوية، تقرأه المكوّنات والاختبارات معًا.
 *
 * المرجع: دليل الهوية الرقمية «جسر التحول» — توجه «وضوح متصل / Spatial Glass»
 * الإصدار ٢٫٠. ألوان الأساس والثانوي والتمييز مستخرجة حرفيًا من ملف شعار
 * مستشفى الحديثة العام، وبقية القيم مشتقّة منها في الدليل ومُحقّقة التباين
 * (٢٣ زوجًا + ١٠٦ عناصر نصية مرسومة، صفر فشل، الأدنى ٤٫٦٦).
 *
 * لا لون مبتكر خارج هذا الملف.
 */

/** ألوان الهوية — الأساس والثانوي والتمييز وتدرّجات الفعل */
export const BRAND_PALETTE = {
  primary: "#057590",
  primaryInk: "#073D4B",
  primaryHover: "#045E74",
  primaryActive: "#034B5D",
  secondary: "#04A67A",
  secondaryInk: "#06563F",
  accent: "#9ECC3B",
} as const;

/** الأسطح والنص والحدود */
export const SURFACE_TOKENS = {
  page: "#DDE4DF",
  section: "#E3ECE7",
  solid: "#FFFFFF",
  ink: "#12353F",
  muted: "#3D5155",
  inkSoft: "#244450",
  inverse: "#FFFFFF",
  inverseMuted: "#D8E8E5",
  night: "#103F4B",
  border: "#C5D3CE",
  controlBorder: "#516C70",
  disabledBg: "#E3EAE8",
  disabledInk: "#53676B",
  selectionBg: "#C7E9E0",
  selectionText: "#12353F",
} as const;

/**
 * الألوان الدلالية الأربعة كما وردت في الدليل.
 * اللون وحده لا ينقل الحالة أبدًا — يلازمه رمز ونص في كل موضع.
 */
export const SEMANTIC_TOKENS = {
  success: "#16704A",
  successBg: "#E8F4ED",
  warning: "#895500",
  warningBg: "#FFF3DA",
  error: "#B2383B",
  errorBg: "#FBECEE",
  info: "#0751A0",
  infoBg: "#EAF2FC",
  focus: "#0751A0",
} as const;

/**
 * الأزرق السماوي القديم لم يعد في اللوحة. يبقى الثابت لأن الاختبار
 * يتحقق من أن أي لون لا يحقق تباينًا كافيًا للنص محجوز للأسطح.
 * `accent` الليموني و`secondary` الأخضر لا يُستخدمان لنص على أبيض.
 */
export const NOT_FOR_TEXT_ON_WHITE: readonly string[] = ["#9ECC3B", "#04A67A"];

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
  new: { fg: "#53676B", tint: "#E3EAE8" },
  reviewed: { fg: "#073D4B", tint: "#E3ECE7" },
  referred: { fg: "#0751A0", tint: "#EAF2FC" },
  waiting: { fg: "#895500", tint: "#FFF3DA" },
  answered: { fg: "#16704A", tint: "#E8F4ED" },
  escalated: { fg: "#103F4B", tint: "#D8E8E5" },
};

/**
 * كل لون مسموح به في الواجهة. أي قيمة سداسية خارج هذه المجموعة تُعدّ مخالفة،
 * ويمنعها اختبار `tests/palette.test.ts`.
 */
export const ALLOWED_HEX: readonly string[] = [
  ...Object.values(BRAND_PALETTE),
  ...Object.values(SURFACE_TOKENS),
  ...Object.values(SEMANTIC_TOKENS),
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

/** الاستدارة والمسافات — سلّم الدليل */
export const SHAPE = {
  spacingUnit: 4,
  spacingScale: [4, 8, 12, 16, 24, 32, 48, 64, 96] as const,
  screenPaddingInline: 16,
  screenPaddingBlockStart: 24,
  radiusSmall: 8,
  radiusButton: 12,
  radiusControl: 12,
  radiusNested: 16,
  radiusCompactCard: 22,
  radiusCard: 24,
  radiusDialog: 24,
  radiusNav: 32,
  radiusPanel: 32,
  radiusIcon: 12,
  radiusTag: 999,
  borderWidth: 1,
  minTouchTarget: 44,
} as const;

/** الحركة — رموز الدليل */
export const MOTION = {
  pressMs: 150,
  componentMs: 280,
  revealMs: 520,
  staggerMs: 60,
  staggerMaxMs: 180,
  exitMs: 180,
  pageOutMs: 190,
  pageInMs: 190,
  pageBlurPx: 6,
  pageDistancePx: 8,
  pressScale: 0.98,
  hoverLiftPx: -2,
  revealDistancePx: 8,
  reducedMs: 1,
  easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  /** يُبقى عليهما لتوافق المكوّنات القائمة */
  enterMs: 280,
} as const;

/**
 * تدرّج الضبابية — أربعة أنواع لكل منها ثلاث درجات.
 * المشهد يُجهَّز صورةً مسبقة التمويه ولا يُحسب وقت التشغيل.
 */
export const BLUR = {
  backgroundSubtle: 1.4,
  backgroundMedium: 12,
  backgroundStrong: 20,
  backdropMedium: 12,
  backdropStrong: 20,
  transitionMedium: 3,
  transitionStrong: 6,
  overlayMedium: 4,
  overlayStrong: 8,
} as const;

/**
 * المواد الزجاجية الأربع. الشفافية في خلفية السطح وحدها،
 * ولا يُطبّق opacity على حاوية تحمل نصًا.
 */
export const GLASS = {
  solid: { fillAlpha: 1, blur: 0, radius: 24 },
  frosted: { fillAlpha: 0.68, blur: 0, radius: 24 },
  dock: { fillAlpha: 0.44, blur: 12, radius: 999 },
  window: { fillAlpha: 0.28, blur: 20, radius: 32 },
  accent: { fillAlpha: 0.94, blur: 0, radius: 24 },
} as const;

/** طبقات العمق الخمس */
export const Z_LAYERS = {
  base: 0,
  decoration: 1,
  content: 10,
  sticky: 100,
  dropdown: 200,
  overlay: 300,
  modal: 400,
  tooltip: 500,
} as const;

/** التخطيط */
export const LAYOUT = {
  maxContent: 1152,
  maxHeader: 1248,
  maxWindow: 1344,
  readingWidth: 680,
  sectionDesktop: 96,
  sectionMobile: 64,
  touchTargetMin: 44,
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

/**
 * الشعار — قواعد الدليل. نسبة الإطار الأصلية محفوظة ولا تُقصّ ولا تُمدّ،
 * ولا يوضع عليه ظل ولا زجاج ولا تمويه.
 */
export const LOGO = {
  aspectRatio: 922.368 / 882.27594,
  minWidth: 128,
  preferredWidth: 144,
  safeAreaRatio: 0.125,
  islandAlpha: 0.92,
} as const;
