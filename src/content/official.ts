export type OfficialTopicSlug = "salary" | "contract" | "service" | "benefits" | "leave" | "qiwa" | "transformation";

export type OfficialTopic = {
  slug: OfficialTopicSlug;
  label: string;
  hint: string;
  keywords: readonly string[];
};

export type OfficialAnswer = {
  id: string;
  topic: OfficialTopicSlug;
  question: string;
  shortAnswer: string;
  sourceLabel: string;
  sourceUrl: string;
  keywords: readonly string[];
};

export type OfficialShort = {
  id: string;
  title: string;
  eyebrow: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
  /** عندما نستلم النسخة المعتمدة MP4 نضعها داخل public/media ونملأ هذا المسار. */
  localSrc: string | null;
};

export const OFFICIAL_FAQ_URL = "https://www.health.sa/ar/faqs";

export const OFFICIAL_TOPICS: readonly OfficialTopic[] = [
  { slug: "salary", label: "راتبي وبدلاتي", hint: "الراتب الأساسي، البدلات والمستحقات", keywords: ["راتب", "رواتب", "بدل", "بدلات", "أجر"] },
  { slug: "contract", label: "عقدي ووظيفتي", hint: "العقد والاستقرار الوظيفي", keywords: ["عقد", "وظيفة", "استقرار", "تسكين", "مسمى"] },
  { slug: "service", label: "الخدمة والتقاعد", hint: "سنوات الخدمة والتأمينات والتقاعد", keywords: ["خدمة", "سنوات", "تقاعد", "تأمينات", "منافع"] },
  { slug: "benefits", label: "المزايا والمكافآت", hint: "مكافأة الانتقال والمزايا", keywords: ["مكافأة", "مزايا", "تعويض", "انتقال"] },
  { slug: "leave", label: "الإجازات والنقل", hint: "الإجازات، النقل والتكليف", keywords: ["إجازة", "اجازة", "نقل", "تكليف"] },
  { slug: "qiwa", label: "منصة قوى", hint: "قبول العقد وخطوات قوى", keywords: ["قوى", "منصة", "قبول", "العقد"] },
  { slug: "transformation", label: "وش يعني التحول؟", hint: "فكرة التحول والصحة القابضة والتجمعات", keywords: ["تحول", "قابضة", "تجمع", "وزارة"] },
] as const;

export const OFFICIAL_ANSWERS: readonly OfficialAnswer[] = [
  {
    id: "salary-protection",
    topic: "salary",
    question: "هل راتبي بينقص بعد الانتقال؟",
    shortAnswer: "حسب التوضيح الرسمي، تسكين الموظف عند الانتقال يكون بما يضمن ألا يقل راتبه عمّا كان يتقاضاه قبل الانتقال.",
    sourceLabel: "الصحة القابضة · قرار مجلس الوزراء رقم 616",
    sourceUrl: "https://www.health.sa/ar/news/health_holding_company_board_approves_organizational_structures_for_health_gatherings",
    keywords: ["راتب", "ينقص", "أقل", "راتبي", "الراتب"],
  },
  {
    id: "service-continuity",
    topic: "service",
    question: "وش يصير على سنوات خدمتي السابقة؟",
    shortAnswer: "أوضحت الصحة القابضة أن خدمة منسوبي الخدمة المدنية تُضم وفق نظام تبادل المنافع، وأن خدمة منسوبي التشغيل الذاتي تُعد مكملة بعد الانتقال وفق القرار.",
    sourceLabel: "الصحة القابضة · قرار مجلس الوزراء رقم 616",
    sourceUrl: "https://www.health.sa/ar/news/health_holding_company_board_approves_organizational_structures_for_health_gatherings",
    keywords: ["خدمة", "سنوات", "تقاعد", "تأمينات", "ضم"],
  },
  {
    id: "transfer-bonus",
    topic: "benefits",
    question: "كيف تُحسب مكافأة الانتقال لموظفي الخدمة المدنية المشمولين؟",
    shortAnswer: "أعلنت الصحة القابضة في مايو 2026 أن المكافأة للمشمولين تُحتسب بنسبة 16٪ من الراتب الأساسي عن كل سنة خدمة، وبحد أقصى أربعة رواتب أساسية.",
    sourceLabel: "الصحة القابضة · 4 مايو 2026",
    sourceUrl: "https://www.health.sa/ar/news/health_holding_company_grants_more_than_two_billion_riyals_in_transfer_bonuses_to_its_civil_service_employees",
    keywords: ["مكافأة", "16", "ستة عشر", "انتقال", "تعويض"],
  },
  {
    id: "qiwa-accept",
    topic: "qiwa",
    question: "كيف أقبل العقد في منصة قوى؟",
    shortAnswer: "من حساب قوى أفراد، ادخل على الخدمات ثم العقود الوظيفية، راجع العقد المرسل وبعدها اختر الإجراء المناسب للقبول أو الرفض.",
    sourceLabel: "الصحة القابضة · كتيب الأسئلة الشائعة للانتقال",
    sourceUrl: OFFICIAL_FAQ_URL,
    keywords: ["قوى", "أقبل", "قبول", "العقد", "منصة"] ,
  },
  {
    id: "qiwa-edit",
    topic: "qiwa",
    question: "أقدر أعدل بنود العقد في قوى قبل ما أقبله؟",
    shortAnswer: "بحسب الكتيب الرسمي، تفاصيل العقد المرسل لا تُعدّل من داخل خطوة القبول؛ القرار يكون قبول أو رفض الصيغة المرفوعة حاليًا.",
    sourceLabel: "الصحة القابضة · كتيب الأسئلة الشائعة للانتقال",
    sourceUrl: OFFICIAL_FAQ_URL,
    keywords: ["تعديل", "بنود", "قوى", "عقد", "أغير"] ,
  },
  {
    id: "training",
    topic: "transformation",
    question: "هل فيه تطوير وتدريب بعد الانتقال؟",
    shortAnswer: "الصحة القابضة أكدت أن الاستثمار في الموظفين جزء من التحول، مع برامج تدريبية تتناسب مع الاحتياجات المهارية والقيادية.",
    sourceLabel: "الصحة القابضة · مجلس الإدارة",
    sourceUrl: "https://www.health.sa/ar/news/health_holding_company_board_approves_organizational_structures_for_health_gatherings",
    keywords: ["تدريب", "تطوير", "مهارات", "قيادة", "موظفين"] ,
  },
] as const;

export const OFFICIAL_SHORTS: readonly OfficialShort[] = [
  {
    id: "employee-journey",
    eyebrow: "رحلة الموظف",
    title: "اعرف أكثر عن التحول ورحلة انتقال الموظف",
    summary: "محتوى رسمي من تجمع الشرقية الصحي يشرح رحلة الانتقال بشكل مبسط.",
    sourceLabel: "تجمع الشرقية الصحي · الصحة القابضة",
    sourceUrl: "https://ae.linkedin.com/posts/e1-cluster_%D9%81%D9%8A%D8%AF%D9%8A%D9%88-%D8%A7%D9%84%D8%AA%D8%AD%D9%88%D9%84%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-%D8%AA%D8%AC%D9%85%D8%B9%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-activity-7217597938082979841-ARjw",
    localSrc: "/media/short-employee-journey.mp4",
  },
  {
    id: "joining-benefits",
    eyebrow: "حقوق ومزايا",
    title: "أهم مزايا الانضمام للمنتقلين من الخدمة المدنية",
    summary: "فيديو رسمي يركز على المزايا التي تهم الموظف وقت الانتقال.",
    sourceLabel: "تجمع الشرقية الصحي · الصحة القابضة",
    sourceUrl: "https://ae.linkedin.com/posts/e1-cluster_%D9%81%D9%8A%D8%AF%D9%8A%D9%88-%D8%AA%D8%AC%D9%85%D8%B9%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-activity-7219694525399674881-Va0B",
    localSrc: "/media/short-joining-benefits.mp4",
  },
  {
    id: "we-transform",
    eyebrow: "أنت أساس التحول",
    title: "بكم نتميز",
    summary: "مقطع رسمي إنساني عن انتقال الموظفين ودورهم في رحلة التحول.",
    sourceLabel: "تجمع الشرقية الصحي · الصحة القابضة",
    sourceUrl: "https://ae.linkedin.com/posts/e1-cluster_%D9%81%D9%8A%D8%AF%D9%8A%D9%88-%D8%AA%D8%AC%D9%85%D8%B9%D8%A7%D9%84%D8%B4%D8%B1%D9%82%D9%8A%D8%A9%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-%D8%A7%D9%84%D8%AA%D8%AD%D9%88%D9%84%D8%A7%D9%84%D8%B5%D8%AD%D9%8A-activity-7218345360140734464-gg8C",
    localSrc: "/media/short-we-transform.mp4",
  },
] as const;

export function answersForTopic(topic: string | null): readonly OfficialAnswer[] {
  if (!topic) return OFFICIAL_ANSWERS.slice(0, 3);
  return OFFICIAL_ANSWERS.filter((item) => item.topic === topic).slice(0, 3);
}
