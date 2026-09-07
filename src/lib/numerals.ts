const ARABIC_INDIC = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"] as const;

/**
 * الأرقام في الواجهة عربية-هندية.
 * المعرّفات ورموز المتابعة تبقى لاتينية داخل نطاق dir="ltr" — لا تمرّرها هنا.
 */
export function toArabicDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => ARABIC_INDIC[Number(d)] ?? d);
}

/** الفاصلة العشرية العربية، مثل: ١٫٥ */
export function toArabicDecimal(value: number, fractionDigits = 1): string {
  return toArabicDigits(value.toFixed(fractionDigits)).replace(".", "٫");
}
