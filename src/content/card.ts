/**
 * نصوص صفحة «سؤالك يفتح الحوار» (/q) — النسخة الرقمية من البطاقة المطبوعة.
 * تُستخدم حرفيًا، وتطابق البطاقة والرول أب في docs/print.
 */
import type { Gate } from "@/lib/classify";

export const CARD_KINDS = ["question", "concern", "challenge", "idea", "rumor"] as const;
export type CardKind = (typeof CARD_KINDS)[number];

/** «معلومة سمعتها» لا بوابة لها في المنصة: تدخل خط العمل سؤالًا، ويبقى نوعها ظاهرًا للسفير */
export const CARD_KIND_GATE: Record<CardKind, Gate> = {
  question: "question",
  concern: "concern",
  challenge: "challenge",
  idea: "idea",
  rumor: "question",
};

export const CARD_KIND_LABELS: Record<CardKind, string> = {
  question: "عندي سؤال",
  concern: "فيه شيء مقلقني",
  challenge: "واجهت صعوبة",
  idea: "عندي اقتراح",
  rumor: "أبي أتأكد من معلومة سمعتها",
};

export const CARD = {
  eyebrow: "جسر التحول",
  eyebrowTail: "صوت الموظف",
  headline: ["سؤالك", "يفتح الحوار"],
  sub: "عن الانتقال إلى شركة الصحة القابضة",
  lede: "كل سؤال يستحق أن يُطرح. اكتب اللي ودّك تفهمه أو تتأكد منه،",
  ledeStrong: "ويوصل صوتك لفريق التحول.",
  formTag: "بطاقة مشاركة",
  formTitle: "وش بخاطرك عن التحوّل؟",
  formSub: "اكتبه بطريقتك: سؤال، شيء مقلقك، صعوبة تواجهك، فكرة، أو معلومة سمعتها وتبي تتأكد منها.",
  kindLabel: "وش نوع مشاركتك؟",
  kindOptional: "(اختياري)",
  bodyLabel: "اكتبها هنا",
  reassurance: "شاركنا براحتك، وسؤالك في أمان.",
  submit: "أرسل سؤالك",
  sending: "يوصل…",
  tooShort: "اكتب كلمتين على الأقل عشان يوصل سؤالك واضح.",
  doneTitle: "وصلنا سؤالك… شكرًا من القلب",
  doneBody: "شكرًا إنك فتحت لنا قلبك. سؤالك ما راح يضيع: بيقرأه سفير التغيير بعناية، ويوصّله لفريق التحول، وكل سؤال مثل سؤالك يقرّبنا كلنا من صورة أوضح.",
  doneCodeLabel: "إذا حاب تتابع الرد، احتفظ بهذا الرمز",
  doneTrack: "تابع الرد",
  doneAgain: "عندي سؤال ثاني",
} as const;
