/**
 * مخطط قاعدة البيانات.
 *
 * قاعدة غير قابلة للتفاوض: **لا يوجد جدول للهوية، لأن الهوية غير مجموعة أصلًا.**
 * لا عمود لاسم ولا رقم وظيفي ولا بريد ولا جوال في أي جدول — لا في المرحلة الحالية
 * ولا في أي مرحلة لاحقة. يحرس هذا اختبار `tests/no-pii-columns.test.ts` ويشغّله CI.
 *
 * المرحلة صفر: لا جداول بعد. الجداول تُضاف في المرحلة ١ حسب PLAN.md.
 */

/** أسماء أعمدة محظورة تمامًا — يفحصها الاختبار على هذا الملف. */
export const FORBIDDEN_COLUMN_PATTERNS: readonly RegExp[] = [
  /\bfull_?name\b/i,
  /\bfirst_?name\b/i,
  /\blast_?name\b/i,
  /\bemployee_?(id|number|no)\b/i,
  /\bnational_?id\b/i,
  /\biqama\b/i,
  /\bemail\b/i,
  /\bphone\b/i,
  /\bmobile\b/i,
  /\bip_?address\b/i,
  /\buser_?agent\b/i,
];

export {};
