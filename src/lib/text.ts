/** تطبيع النص العربي المشترك بين التجميع والشائعات والتصنيف. */
const TASHKEEL = /[ؐ-ًؚ-ٰٟۖ-ۭـ]/g;

export function normalizeArabic(text: string): string {
  return text
    .replace(TASHKEEL, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const STOP = new Set([
  "في", "من", "على", "عن", "الى", "إلى", "ان", "أن", "إن", "هل", "ما", "ماذا", "متى", "كيف", "لماذا",
  "هذا", "هذه", "ذلك", "تلك", "هو", "هي", "هم", "انا", "نحن", "انت", "او", "أو", "و", "ثم", "لا", "لم",
  "لن", "قد", "كان", "كانت", "يكون", "تكون", "مع", "بعد", "قبل", "عند", "كل", "بعض", "اي", "أي",
  "التي", "الذي", "الذين", "حتى", "اذا", "إذا", "لو", "بس", "يعني", "ايش", "وش", "ليش", "شي", "شيء",
  "عندي", "عندنا", "لي", "لنا", "له", "لها", "لهم", "به", "بها", "بهم", "فيه", "فيها", "عليه", "عليها",
  "الان", "الآن", "ابي", "ابغى", "اريد", "ودي", "سمعت", "سمعنا", "يقولون", "قالوا", "صحيح", "معلومة",
  "يصير", "بيصير", "راح", "رح", "يحدث", "سيحدث", "بيتم", "يتم", "سيتم", "بيكون", "سيكون", "حيكون", "ماذا", "وش", "ايش",
]);

const PREFIXES = ["وال", "بال", "كال", "فال", "لل", "ال", "و", "ف", "ب", "ل", "س"];
const SUFFIXES = ["اتها", "اتهم", "ات", "ون", "ين", "ان", "ها", "هم", "نا", "كم", "ه", "ك", "ي", "ت"];

/** تجذيع خفيف: إزالة السوابق واللواحق الشائعة فقط */
export function stem(word: string): string {
  let w = word;
  for (const p of PREFIXES) {
    if (w.length - p.length >= 3 && w.startsWith(p)) {
      w = w.slice(p.length);
      break;
    }
  }
  for (const s of SUFFIXES) {
    if (w.length - s.length >= 3 && w.endsWith(s)) {
      w = w.slice(0, -s.length);
      break;
    }
  }
  // جمع التكسير على وزن «فُعول»: عقود ← عقد · بنود ← بند
  if (w.length === 4 && w[2] === "و") w = w.slice(0, 2) + w.slice(3);
  return w;
}

export function tokenize(text: string): string[] {
  return normalizeArabic(text)
    .split(" ")
    .filter((w) => w.length >= 2 && !STOP.has(w))
    .map(stem)
    .filter((w) => w.length >= 2);
}

export function stemSet(text: string): Set<string> {
  return new Set(tokenize(text));
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter += 1;
  return inter / (a.size + b.size - inter);
}
