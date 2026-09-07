/**
 * آلة حالات المشاركة — الانتقالات المسموحة فقط تمرّ من هنا.
 * new → reviewed → needs_referral → referred → answered → published
 * جانبية: merged · out_of_scope · redirected · deleted_by_author
 */
export const SUBMISSION_STATES = [
  "new",
  "reviewed",
  "needs_referral",
  "referred",
  "answered",
  "published",
  "merged",
  "out_of_scope",
  "redirected",
  "deleted_by_author",
] as const;

export type SubmissionState = (typeof SUBMISSION_STATES)[number];

const CLOSING: readonly SubmissionState[] = ["merged", "out_of_scope", "redirected"];

export const TRANSITIONS: Record<SubmissionState, readonly SubmissionState[]> = {
  new: ["reviewed", ...CLOSING, "deleted_by_author"],
  reviewed: ["needs_referral", "referred", "answered", ...CLOSING, "deleted_by_author"],
  needs_referral: ["referred", "answered", ...CLOSING, "deleted_by_author"],
  referred: ["answered", "out_of_scope", "redirected", "deleted_by_author"],
  answered: ["published", "deleted_by_author"],
  published: ["deleted_by_author"],
  merged: ["deleted_by_author"],
  out_of_scope: ["deleted_by_author"],
  redirected: ["deleted_by_author"],
  deleted_by_author: [],
};

export class IllegalTransitionError extends Error {
  constructor(
    public readonly from: SubmissionState,
    public readonly to: SubmissionState,
  ) {
    super(`انتقال غير مسموح: ${from} → ${to}`);
    this.name = "IllegalTransitionError";
  }
}

export function isSubmissionState(value: string): value is SubmissionState {
  return (SUBMISSION_STATES as readonly string[]).includes(value);
}

export function canTransition(from: SubmissionState, to: SubmissionState): boolean {
  return TRANSITIONS[from].includes(to);
}

/** يعيد الحالة الجديدة أو يرمي خطأً. لا طريق آخر لتغيير الحالة. */
export function transition(from: SubmissionState, to: SubmissionState): SubmissionState {
  if (!canTransition(from, to)) throw new IllegalTransitionError(from, to);
  return to;
}

/** الحالة كما تُعرض للموظف — ست حالات ظاهرة */
export type VisibleStatus = "new" | "reviewed" | "referred" | "waiting" | "answered" | "escalated";

export function toVisibleStatus(state: SubmissionState, overdue = false): VisibleStatus {
  if (overdue && (state === "referred" || state === "needs_referral")) return "escalated";
  switch (state) {
    case "new":
      return "new";
    case "reviewed":
    case "merged":
      return "reviewed";
    case "needs_referral":
      return "waiting";
    case "referred":
      return "referred";
    case "answered":
    case "published":
      return "answered";
    case "out_of_scope":
    case "redirected":
      return "escalated";
    case "deleted_by_author":
      return "reviewed";
  }
}

/** سقوف SLA بالساعات */
export const SLA_HOURS = {
  classify: 24,
  refer: 48,
  answerBusinessDays: 7,
  rumorVerdict: 48,
} as const;

/** يضيف أيام عمل (الأحد–الخميس) */
export function addBusinessDays(from: Date, days: number): Date {
  const d = new Date(from);
  let remaining = days;
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay(); // 5 = الجمعة · 6 = السبت
    if (dow !== 5 && dow !== 6) remaining -= 1;
  }
  return d;
}

export function slaDueFor(state: SubmissionState, at: Date): Date | null {
  switch (state) {
    case "new":
      return new Date(at.getTime() + SLA_HOURS.classify * 3_600_000);
    case "needs_referral":
      return new Date(at.getTime() + SLA_HOURS.refer * 3_600_000);
    case "referred":
      return addBusinessDays(at, SLA_HOURS.answerBusinessDays);
    default:
      return null;
  }
}
