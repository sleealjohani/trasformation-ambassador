/** الإلحاح المحسوب للوارد ووزن القضايا وعتبة الظهور. */

export const VISIBILITY_THRESHOLD = 7;

export type UrgencyInput = {
  /** عدد المشاركات المشابهة (في القضية نفسها) */
  repeat: number;
  /** أعلى تكرار في الوارد كله للتطبيع */
  maxRepeat: number;
  createdAt: Date;
  now: Date;
  /** إشارات القلق ١–٥ */
  urgency: number;
};

/** = 0.5×تكرار + 0.3×حداثة + 0.2×إشارات القلق — كلها مطبّعة إلى [0,1] */
export function computeUrgencyScore({ repeat, maxRepeat, createdAt, now, urgency }: UrgencyInput): number {
  const repeatScore = maxRepeat > 0 ? Math.min(1, repeat / maxRepeat) : 0;
  const ageHours = Math.max(0, (now.getTime() - createdAt.getTime()) / 3_600_000);
  const recencyScore = Math.max(0, 1 - ageHours / (7 * 24));
  const anxietyScore = Math.min(1, Math.max(0, (urgency - 1) / 4));
  return Number((0.5 * repeatScore + 0.3 * recencyScore + 0.2 * anxietyScore).toFixed(3));
}

/** الوزن الأسبوعي للقضية = أصوات الأسبوع + مشاركات الأسبوع المدمجة */
export function computeIssueWeight(votesThisWeek: number, submissionsThisWeek: number): number {
  return votesThisWeek + submissionsThisWeek;
}

/**
 * عتبة الظهور ٧: أي تقسيم (قسم/فئة) دون ٧ مشاركات لا يُعرض.
 * يعيد التقسيمات المسموح عرضها فقط، ويجمع الباقي في «أخرى» إن بلغت العتبة مجتمعة.
 */
export function applyVisibilityThreshold<T extends { key: string; count: number }>(
  rows: readonly T[],
  threshold = VISIBILITY_THRESHOLD,
): Array<{ key: string; count: number }> {
  const visible = rows.filter((r) => r.count >= threshold).map((r) => ({ key: r.key, count: r.count }));
  const hidden = rows.filter((r) => r.count < threshold).reduce((n, r) => n + r.count, 0);
  if (hidden >= threshold) visible.push({ key: "other", count: hidden });
  return visible;
}

export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? (sorted[mid] ?? null) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** مؤشر وضوح التحول = (متوسط النبض ÷ ٥) × ١٠٠ — لا يُعلن دون ٢٠ ردًا */
export const PULSE_MIN_SAMPLE = 20;

export function clarityIndex(average: number): number {
  return Number(((average / 5) * 100).toFixed(1));
}

/** مفتاح الأسبوع بصيغة ISO: 2026-W37 */
export function isoWeek(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function previousIsoWeeks(from: Date, n: number): string[] {
  const out: string[] = [];
  for (let i = 1; i <= n; i += 1) {
    out.unshift(isoWeek(new Date(from.getTime() - i * 7 * 86_400_000)));
  }
  return out;
}
