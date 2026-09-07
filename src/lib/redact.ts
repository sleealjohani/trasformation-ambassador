/**
 * التنقية — تُطبَّق على الجهاز أولًا ثم على الخادم.
 * لا تعتمد على أي واجهة خاصة بالمتصفح أو Node حتى تعمل في الطرفين حرفيًا بالنتيجة نفسها.
 */
export const REDACTION_MARK = "[معلومة معرِّفة أُزيلت]";

export type RedactionKind = "email" | "phone" | "employee_id" | "long_number" | "name";

export type RedactionHit = { kind: RedactionKind };

export type RedactionResult = { clean: string; hits: RedactionHit[] };

/** الأرقام العربية-الهندية تُطبَّع إلى لاتينية قبل المطابقة حتى لا تُفلت */
function normalizeDigits(text: string): string {
  return text.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)));
}

/** حروف النهاية العربية التي قد تلتصق بالكلمة التالية للاسم */
const NAME_WORD = "[\\p{L}\\p{M}'’]{2,}";

const PATTERNS: ReadonlyArray<{ kind: RedactionKind; re: RegExp }> = [
  { kind: "email", re: /[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu },
  // جوال سعودي: 05xxxxxxxx · 5xxxxxxxx · +9665xxxxxxxx · 009665xxxxxxxx · مع فواصل أو شرطات
  { kind: "phone", re: /(?:\+?966|00966|0)?[\s-]?5[\s-]?(?:\d[\s-]?){8}/g },
  // الرقم الوظيفي بصيغه الشائعة
  {
    kind: "employee_id",
    re: /(?:رقم(?:ي)?\s*(?:ال)?وظيفي|الرقم\s*الوظيفي|رقم\s*(?:ال)?موظف|emp(?:loyee)?\s*(?:id|no|#)?|badge|id)\s*[:#：]?\s*[A-Za-z]{0,3}[-\s]?\d{3,}/giu,
  },
  // أي رقم من ٤ خانات فأكثر (هوية، إقامة، حساب…)
  { kind: "long_number", re: /\d(?:[\s-]?\d){3,}/g },
  // «اسمي فلان» · «أنا فلان الفلاني» · «معك فلان»
  {
    kind: "name",
    re: new RegExp(
      `(?:اسمي|أنا|انا|معك|معاك|أدعى|ادعى|يسمونني|اسمى)\\s+(?:ال)?${NAME_WORD}(?:\\s+(?!و|ف)(?:ال)?${NAME_WORD}){0,1}`,
      "gu",
    ),
  },
];

/** كلمات تلي «أنا» ولا تُعدّ اسمًا: صفات وحالات شائعة */
const NOT_NAMES = new Set([
  "موظف", "موظفة", "ممرض", "ممرضة", "طبيب", "طبيبة", "فني", "فنية", "إداري", "إدارية", "قلق",
  "قلقة", "خايف", "خايفة", "متأكد", "متأكدة", "ما", "لا", "مو", "مش", "أعمل", "اعمل", "أشتغل",
  "اشتغل", "عندي", "أبي", "أبغى", "ابغى", "أريد", "اريد", "حاليا", "حالياً", "حاليًا", "في", "من",
  "على", "عن", "مع", "أسأل", "اسأل", "أحتاج", "احتاج", "سمعت", "متردد", "مترددة", "جديد", "جديدة",
]);

function isNameHit(match: string): boolean {
  const words = match.trim().split(/\s+/);
  const first = words[1] ?? "";
  const bare = first.replace(/^(?:و|ف)?(?:ال)?/, "");
  return !NOT_NAMES.has(first) && !NOT_NAMES.has(bare);
}

export function redact(input: string): RedactionResult {
  let clean = normalizeDigits(input);
  const hits: RedactionHit[] = [];

  for (const { kind, re } of PATTERNS) {
    clean = clean.replace(re, (match: string) => {
      if (kind === "name" && !isNameHit(match)) return match;
      hits.push({ kind });
      return REDACTION_MARK;
    });
  }

  // دمج علامتين متجاورتين حتى لا يظهر التكرار للموظف
  clean = clean.replace(new RegExp(`(?:\\${REDACTION_MARK.replace("[", "\\[")}\\s*){2,}`, "g"), REDACTION_MARK);

  return { clean: clean.trim(), hits };
}

/** هل يحتوي النص على ما يشبه اسم شخص أو لقبًا يليه اسم؟ يُستخدم لحجب الشائعات آليًا. */
export function mentionsPerson(text: string): boolean {
  const honorific =
    /(?:الدكتور|الدكتورة|د\.|الأستاذ|الأستاذة|أ\.|المدير|المديرة|المهندس|المهندسة|الشيخ|السيد|السيدة|أبو|أم)\s+[\p{L}\p{M}]{2,}/u;
  return honorific.test(text) || redact(text).hits.some((h) => h.kind === "name");
}
