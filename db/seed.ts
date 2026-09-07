/**
 * البذر — يزرع محتوى القسم ٦ من SPEC.md حرفيًا.
 * قابل لإعادة التشغيل بلا تكرار: كل صف بمفتاح ثابت (upsert).
 * كل البيانات مختلقة لغرض التشغيل، ولا اسم موظف واحد فيها.
 */
import "./env";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { TOPIC_KEYWORDS } from "../src/lib/classify";
import { toClusterKey } from "../src/lib/cluster";
import { normalizeArabic } from "../src/lib/text";
import { clarityIndex, previousIsoWeeks } from "../src/lib/ranking";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL غير مضبوط.");

const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client, { schema });

/** معرّفات ثابتة للبذر حتى تكون إعادة التشغيل آمنة */
const FIXED = {
  issue: {
    contracts: "10000000-0000-4000-8000-000000000001",
    salaries: "10000000-0000-4000-8000-000000000002",
    jobSecurity: "10000000-0000-4000-8000-000000000003",
    evaluation: "10000000-0000-4000-8000-000000000004",
    transfer: "10000000-0000-4000-8000-000000000005",
    training: "10000000-0000-4000-8000-000000000006",
    serviceYears: "10000000-0000-4000-8000-000000000007",
    startDate: "10000000-0000-4000-8000-000000000008",
  },
  answer: { serviceYears: "20000000-0000-4000-8000-000000000001" },
  faq: {
    contracts: "30000000-0000-4000-8000-000000000001",
    serviceYears: "30000000-0000-4000-8000-000000000002",
    startDate: "30000000-0000-4000-8000-000000000003",
  },
  knowledge: {
    salaries: "40000000-0000-4000-8000-000000000001",
    supervision: "40000000-0000-4000-8000-000000000002",
    channels: "40000000-0000-4000-8000-000000000003",
    unclearStart: "40000000-0000-4000-8000-000000000011",
    unclearAllowances: "40000000-0000-4000-8000-000000000012",
    unclearGrievance: "40000000-0000-4000-8000-000000000013",
    changedChannelsOld: "40000000-0000-4000-8000-000000000021",
  },
  rumor: {
    allowances: "50000000-0000-4000-8000-000000000001",
    contracts: "50000000-0000-4000-8000-000000000002",
  },
  journey: [
    "60000000-0000-4000-8000-000000000001",
    "60000000-0000-4000-8000-000000000002",
    "60000000-0000-4000-8000-000000000003",
    "60000000-0000-4000-8000-000000000004",
    "60000000-0000-4000-8000-000000000005",
  ],
} as const;

const NO_OFFICIAL_INFO = "لم يصدر توضيح رسمي حتى الآن.";

export const TOPIC_ROWS = [
  { slug: "contracts", label: "العقود", sort: 1 },
  { slug: "salaries", label: "الرواتب والبدلات", sort: 2 },
  { slug: "job-security", label: "الأمان الوظيفي", sort: 3 },
  { slug: "evaluation", label: "التقييم الوظيفي", sort: 4 },
  { slug: "transfer", label: "النقل والتكليف", sort: 5 },
  { slug: "structure", label: "الهيكل والصلاحيات", sort: 6 },
  { slug: "systems", label: "الأنظمة والإجراءات", sort: 7 },
  { slug: "training", label: "التدريب", sort: 8 },
  { slug: "communication", label: "التواصل والمعلومات", sort: 9 },
  { slug: "other", label: "أخرى", sort: 10 },
] as const;

async function seedTopics() {
  for (const t of TOPIC_ROWS) {
    const keywords = TOPIC_KEYWORDS.find((k) => k.slug === t.slug)?.keywords ?? [];
    await db
      .insert(schema.topics)
      .values({ ...t, keywords: [...keywords] })
      .onConflictDoUpdate({ target: schema.topics.slug, set: { label: t.label, sort: t.sort, keywords: [...keywords] } });
  }
}

async function upsertIssue(row: {
  id: string;
  title: string;
  topic: string;
  weight: number;
  status: string;
  answerId?: string;
  slaDueAt?: Date;
}) {
  const titleNorm = toClusterKey(row.title);
  await db
    .insert(schema.issues)
    .values({ ...row, titleNorm, answerId: row.answerId ?? null, slaDueAt: row.slaDueAt ?? null })
    .onConflictDoUpdate({
      target: schema.issues.id,
      set: { title: row.title, titleNorm, topic: row.topic, weight: row.weight, status: row.status, answerId: row.answerId ?? null },
    });
}

async function seedIssues() {
  const now = new Date();
  const inDays = (d: number) => new Date(now.getTime() + d * 86_400_000);

  await upsertIssue({ id: FIXED.issue.contracts, title: "ماذا سيحدث لعقود الموظفين؟", topic: "contracts", weight: 38, status: "referred", slaDueAt: inDays(5) });
  await upsertIssue({ id: FIXED.issue.salaries, title: "هل تتغيّر آلية صرف الرواتب والبدلات؟", topic: "salaries", weight: 31, status: "open" });
  await upsertIssue({ id: FIXED.issue.jobSecurity, title: "هل يستمر الجميع في وظائفهم بعد الانتقال؟", topic: "job-security", weight: 27, status: "open" });
  await upsertIssue({ id: FIXED.issue.evaluation, title: "كيف يكون تقييم الأداء في الشركة الجديدة؟", topic: "evaluation", weight: 19, status: "open" });
  await upsertIssue({ id: FIXED.issue.transfer, title: "هل يُنقل أحد إلى منشأة أخرى بسبب التحول؟", topic: "transfer", weight: 14, status: "open" });
  await upsertIssue({ id: FIXED.issue.training, title: "ما التدريب المطلوب قبل الانتقال؟", topic: "training", weight: 9, status: "open" });
  await upsertIssue({ id: FIXED.issue.serviceYears, title: "هل تتأثر مدة الخدمة السابقة؟", topic: "contracts", weight: 6, status: "answered", answerId: FIXED.answer.serviceYears });
  await upsertIssue({ id: FIXED.issue.startDate, title: "متى تبدأ مرحلة الانتقال الفعلي؟", topic: "communication", weight: 7, status: "waiting" });

  await db
    .insert(schema.answers)
    .values({
      id: FIXED.answer.serviceYears,
      issueId: FIXED.issue.serviceYears,
      answer: "تُحتسب مدة الخدمة السابقة كما هي، ولا يترتب على الانتقال إعادة احتسابها.",
      source: "فريق التحول",
    })
    .onConflictDoNothing();
}

async function seedFaqs() {
  const rows = [
    { id: FIXED.faq.contracts, question: "ماذا سيحدث لعقود الموظفين؟", answer: null, source: null, topic: "contracts", status: "referred", interestCount: 162, issueId: FIXED.issue.contracts },
    {
      id: FIXED.faq.serviceYears,
      question: "هل تتأثر مدة الخدمة السابقة؟",
      answer: "تُحتسب مدة الخدمة السابقة كما هي، ولا يترتب على الانتقال إعادة احتسابها.",
      source: "فريق التحول",
      topic: "contracts",
      status: "published",
      interestCount: 94,
      issueId: FIXED.issue.serviceYears,
    },
    { id: FIXED.faq.startDate, question: "متى تبدأ مرحلة الانتقال الفعلي؟", answer: null, source: null, topic: "communication", status: "waiting", interestCount: 77, issueId: FIXED.issue.startDate },
  ];
  for (const r of rows) {
    await db
      .insert(schema.faqs)
      .values(r)
      .onConflictDoUpdate({ target: schema.faqs.id, set: { question: r.question, answer: r.answer, source: r.source, topic: r.topic, status: r.status, interestCount: r.interestCount } });
  }
}

async function seedKnowledge() {
  const known = [
    { id: FIXED.knowledge.salaries, title: "استمرارية صرف الرواتب", body: "تستمر الرواتب بآليتها الحالية حتى إشعار رسمي لاحق.", source: "تعميم فريق التحول", sort: 1 },
    { id: FIXED.knowledge.supervision, title: "جهة الإشراف الإداري", body: "الإشراف اليومي يبقى كما هو خلال المرحلة الانتقالية.", source: "محضر اجتماع التحول", sort: 2 },
    { id: FIXED.knowledge.channels, title: "قنوات التواصل المعتمدة", body: "الأسئلة تُستقبل عبر هذه المنصة وتُحال لفريق التحول.", source: "سفير التغيير بالمنشأة", sort: 3 },
  ];
  const unclear = [
    { id: FIXED.knowledge.unclearStart, title: "موعد بدء الانتقال الفعلي", sort: 1 },
    { id: FIXED.knowledge.unclearAllowances, title: "آلية احتساب البدلات بعد نقل العقود", sort: 2 },
    { id: FIXED.knowledge.unclearGrievance, title: "مسار التظلم أثناء المرحلة الانتقالية", sort: 3 },
  ];

  for (const k of known) {
    await db
      .insert(schema.knowledgeItems)
      .values({ ...k, kind: "known", effectiveDate: new Date() })
      .onConflictDoUpdate({ target: schema.knowledgeItems.id, set: { title: k.title, body: k.body, source: k.source, kind: "known", sort: k.sort } });
  }
  for (const u of unclear) {
    await db
      .insert(schema.knowledgeItems)
      .values({ ...u, kind: "unclear", body: NO_OFFICIAL_INFO, source: "سفير التغيير بالمنشأة" })
      .onConflictDoUpdate({ target: schema.knowledgeItems.id, set: { title: u.title, body: NO_OFFICIAL_INFO, kind: "unclear", sort: u.sort } });
  }
  // «ما الذي تغيّر» يُبنى من البطاقات التي لها superseded_by: نسخة قديمة من بطاقة القنوات
  await db
    .insert(schema.knowledgeItems)
    .values({
      id: FIXED.knowledge.changedChannelsOld,
      kind: "known",
      title: "قنوات التواصل المعتمدة",
      body: "الأسئلة تُستقبل عبر البريد الداخلي لإدارة المنشأة.",
      source: "سفير التغيير بالمنشأة",
      supersededBy: FIXED.knowledge.channels,
      sort: 9,
    })
    .onConflictDoUpdate({ target: schema.knowledgeItems.id, set: { supersededBy: FIXED.knowledge.channels } });
}

async function seedRumors() {
  const rows = [
    {
      id: FIXED.rumor.allowances,
      claimText: "ستتوقف البدلات بعد التحول",
      count: 43,
      verdict: "false",
      officialText: "لم يصدر أي قرار بإيقاف البدلات، وأي تعديل مستقبلي يصدر بتعميم رسمي.",
      published: true,
      verdictAt: new Date(),
      needsEscalation: false,
    },
    {
      id: FIXED.rumor.contracts,
      claimText: "ستُعاد صياغة جميع العقود خلال شهر",
      count: 21,
      verdict: "waiting",
      officialText: null,
      published: true,
      verdictAt: null,
      needsEscalation: true,
    },
  ];
  for (const r of rows) {
    const claimNorm = normalizeArabic(r.claimText);
    await db
      .insert(schema.rumors)
      .values({ ...r, claimNorm })
      .onConflictDoUpdate({
        target: schema.rumors.id,
        set: { claimText: r.claimText, claimNorm, count: r.count, verdict: r.verdict, officialText: r.officialText, published: r.published, needsEscalation: r.needsEscalation },
      });
  }
}

async function seedJourney() {
  const stages = [
    {
      title: "التوعية",
      state: "done",
      whatHappens: "التعريف بمشروع التحول إلى شركة الصحة القابضة وأهدافه، وفتح قنوات الأسئلة.",
      employeeAction: "الاطلاع على المواد التعريفية وطرح ما يشغلك عبر هذه المنصة.",
      openQuestions: [],
    },
    {
      title: "الاستعداد",
      state: "current",
      whatHappens: "حصر الأسئلة والمخاوف، وإعداد الإجابات الرسمية، وتجهيز الإجراءات الانتقالية.",
      employeeAction: "تابع جسر المعرفة، وصوّت على القضايا التي تشغلك، وأجب عن نبض الأسبوع.",
      openQuestions: ["موعد بدء الانتقال الفعلي", "آلية احتساب البدلات بعد نقل العقود"],
    },
    {
      title: "الانتقال",
      state: "upcoming",
      whatHappens: "نقل العقود والصلاحيات وفق ما يصدر رسميًا.",
      employeeAction: "لا إجراء مطلوب منك الآن؛ ستصلك التعليمات الرسمية عند اعتمادها.",
      openQuestions: ["مسار التظلم أثناء المرحلة الانتقالية"],
    },
    {
      title: "التطبيق",
      state: "upcoming",
      whatHappens: "تشغيل الأنظمة والإجراءات الجديدة تدريجيًا.",
      employeeAction: "المشاركة في التدريب الذي يُعلن عنه رسميًا.",
      openQuestions: [],
    },
    {
      title: "الاستقرار",
      state: "upcoming",
      whatHappens: "قياس الأثر ومعالجة ما تبقّى من فجوات.",
      employeeAction: "استمر في مشاركة ما يشغلك؛ القناة تبقى مفتوحة.",
      openQuestions: [],
    },
  ];
  for (const [i, s] of stages.entries()) {
    const id = FIXED.journey[i];
    if (!id) continue;
    await db
      .insert(schema.journeyStages)
      .values({ id, sort: i + 1, ...s })
      .onConflictDoUpdate({ target: schema.journeyStages.id, set: { sort: i + 1, ...s } });
  }
}

async function seedPulse() {
  const weeks = previousIsoWeeks(new Date(), 4);
  const indices = [54, 61, 68, 74];
  for (const [i, week] of weeks.entries()) {
    const index = indices[i] ?? 0;
    // المؤشر = (متوسط ÷ ٥) × ١٠٠ ⟸ المتوسط = المؤشر × ٥ ÷ ١٠٠
    const average = (index * 5) / 100;
    await db
      .insert(schema.pulseWeeks)
      .values({ week, clarityIndex: String(clarityIndex(average)), sample: 20 + i * 4, published: true })
      .onConflictDoUpdate({ target: schema.pulseWeeks.week, set: { clarityIndex: String(clarityIndex(average)), sample: 20 + i * 4, published: true } });
  }
}

async function main() {
  await seedTopics();
  await seedIssues();
  await seedFaqs();
  await seedKnowledge();
  await seedRumors();
  await seedJourney();
  await seedPulse();

  const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(schema.issues);
  const topics = await db.select({ slug: schema.topics.slug }).from(schema.topics).where(eq(schema.topics.slug, "contracts"));
  console.log(`✓ البذر مكتمل — ${count} قضية · ${topics.length ? "المواضيع مزروعة" : "المواضيع ناقصة"}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => client.end());
