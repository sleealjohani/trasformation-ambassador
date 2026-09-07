/**
 * التصنيف بالقواعد — النسخة الأولى بلا نموذج ذكاء.
 * الواجهة `Classifier` ثابتة حتى يُستبدل المزوّد لاحقًا دون تغيير أي شاشة.
 */
import { normalizeArabic, tokenize } from "./text";

export type Gate = "question" | "concern" | "challenge" | "idea";
export type SubmissionType = Gate;
export type Sentiment = "calm" | "uncertain" | "anxious" | "frustrated";

export type Classification = {
  type: SubmissionType;
  topic: string | null;
  subTopic: string | null;
  urgency: number;
  sentiment: Sentiment;
  confidence: number;
  needsReading: boolean;
};

export interface Classifier {
  classify(text: string, gate: Gate): Promise<Classification>;
}

/** أقل من ٠٫٦ ⟶ صندوق «يحتاج قراءة» بلا تصنيف آلي */
export const CONFIDENCE_FLOOR = 0.6;

export type TopicKeywords = { slug: string; keywords: readonly string[] };

/** خرائط الكلمات المفتاحية — جذوع مطبّعة */
export const TOPIC_KEYWORDS: readonly TopicKeywords[] = [
  { slug: "contracts", keywords: ["عقد", "عقود", "تجديد", "مده", "توقيع", "بند", "انهاء", "فسخ", "الغاء", "تعاقد", "ثابت", "مؤقت"] },
  { slug: "salaries", keywords: ["راتب", "رواتب", "بدل", "بدلات", "علاوه", "مكافاه", "مكافات", "اجر", "صرف", "خصم", "سلم", "درجه", "تامين", "تقاعد", "تاخير"] },
  { slug: "job-security", keywords: ["امان", "استغناء", "تسريح", "فصل", "وظيفتي", "ابقى", "استمر", "استمرار", "مستقبل", "ضمان", "تثبيت", "الغاء", "استقرار"] },
  { slug: "evaluation", keywords: ["تقييم", "اداء", "مؤشر", "مؤشرات", "ترقيه", "ترقيات", "معايير", "نتيجه", "تقدير"] },
  { slug: "transfer", keywords: ["نقل", "تكليف", "انتداب", "منشاه", "مدينه", "موقع", "اعاره", "ندب", "تنقل", "انتقال"] },
  { slug: "structure", keywords: ["هيكل", "صلاحيه", "صلاحيات", "مرجعيه", "مدير", "اداره", "تبعيه", "اشراف", "مسمى", "تنظيم", "قسم"] },
  { slug: "systems", keywords: ["نظام", "انظمه", "اجراء", "اجراءات", "سياسه", "لائحه", "لوائح", "برنامج", "منصه", "بوابه", "تطبيق", "حضور", "بصمه", "اجازه", "اجازات"] },
  { slug: "training", keywords: ["تدريب", "دوره", "دورات", "تاهيل", "تطوير", "شهاده", "مهارات", "تعلم"] },
  { slug: "communication", keywords: ["تواصل", "معلومه", "معلومات", "توضيح", "اعلان", "تعميم", "اجتماع", "شفافيه", "رد", "اسمع", "اشاعه", "شائعات", "خبر"] },
];

const ANXIETY_SIGNALS = ["خايف", "خائف", "خوف", "قلق", "قلقان", "متوتر", "ما ادري", "مو عارف", "مش عارف", "ضايع", "مصير", "خطر", "اخاف", "مرعوب", "غير مطمئن"];
const FRUSTRATION_SIGNALS = ["زعلان", "محبط", "تعبت", "ملل", "مستاء", "غاضب", "ظلم", "مافيه فايده", "ما فيه فايده", "معقول"];
const TIMING_SIGNALS = ["متى", "الموعد", "التاريخ", "قريب", "بكره", "الشهر", "الاسبوع"];

function countSignals(normalized: string, signals: readonly string[]): number {
  return signals.reduce((n, s) => (normalized.includes(normalizeArabic(s)) ? n + 1 : n), 0);
}

export function scoreTopics(text: string, maps: readonly TopicKeywords[] = TOPIC_KEYWORDS) {
  const tokens = tokenize(text);
  const scores = new Map<string, number>();
  let total = 0;
  for (const { slug, keywords } of maps) {
    const stems = new Set(keywords.flatMap((k) => tokenize(k)).concat(keywords.map(normalizeArabic)));
    let hits = 0;
    for (const t of tokens) if (stems.has(t)) hits += 1;
    if (hits > 0) {
      scores.set(slug, hits);
      total += hits;
    }
  }
  return { scores, total };
}

export function classifyByRules(text: string, gate: Gate, maps: readonly TopicKeywords[] = TOPIC_KEYWORDS): Classification {
  const normalized = normalizeArabic(text);
  const { scores, total } = scoreTopics(text, maps);

  let topic: string | null = null;
  let top = 0;
  for (const [slug, hits] of scores) {
    if (hits > top) {
      top = hits;
      topic = slug;
    }
  }

  const confidence = total === 0 ? 0 : Number((top / total).toFixed(3));
  const needsReading = confidence < CONFIDENCE_FLOOR;

  const anxiety = countSignals(normalized, ANXIETY_SIGNALS);
  const frustration = countSignals(normalized, FRUSTRATION_SIGNALS);
  const timing = countSignals(normalized, TIMING_SIGNALS);

  const sentiment: Sentiment =
    frustration > 0 ? "frustrated" : anxiety > 0 ? "anxious" : timing > 0 ? "uncertain" : "calm";

  const urgency = Math.min(5, 1 + anxiety + frustration + (timing > 0 ? 1 : 0) + (gate === "concern" ? 1 : 0));

  return {
    type: gate,
    topic: needsReading ? null : topic,
    subTopic: null,
    urgency,
    sentiment,
    confidence,
    needsReading,
  };
}

export const rulesClassifier: Classifier = {
  classify: async (text, gate) => classifyByRules(text, gate),
};

let activeClassifier: Classifier = rulesClassifier;

/** يسمح بتسجيل مزوّد نماذج لاحقًا دون لمس أي شاشة */
export function registerClassifier(classifier: Classifier): void {
  activeClassifier = classifier;
}

export function getClassifier(): Classifier {
  return activeClassifier;
}
