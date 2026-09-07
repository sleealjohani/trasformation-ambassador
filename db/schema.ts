/**
 * مخطط قاعدة البيانات.
 *
 * قاعدة غير قابلة للتفاوض: **لا يوجد جدول للهوية، لأن الهوية غير مجموعة أصلًا.**
 * لا عمود لاسم ولا رقم وظيفي ولا بريد ولا جوال في أي جدول.
 * يحرس هذا اختبار `tests/no-pii-columns.test.ts` وسكربت `scripts/check-schema.mjs` في CI.
 *
 * `device_hash` قيمة عشوائية مولّدة على الجهاز ثم مُلبّدة مرتين، تُجدَّد كل ٣٠ يومًا،
 * وتُستخدم لمنع التكرار وتحديد المعدّل فقط — لا تعرّف بشخص.
 */
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const id = () => uuid("id").primaryKey().defaultRandom();
const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** التصنيف الموضوعي — قائمة مغلقة تُزرع من البذر */
export const topics = pgTable("topics", {
  slug: text("slug").primaryKey(),
  label: text("label").notNull(),
  sort: smallint("sort").notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
});

export const submissions = pgTable(
  "submissions",
  {
    id: id(),
    refHash: text("ref_hash").notNull(),
    gate: text("gate").notNull(),
    type: text("type").notNull(),
    topic: text("topic"),
    subTopic: text("sub_topic"),
    /** النص المنقّى فقط. يُصبح NULL عند حذف المرسل ويبقى الصف للعدّاد. */
    bodyClean: text("body_clean"),
    /** أجوبة أسئلة المتابعة، منقّاة */
    answersClean: jsonb("answers_clean").$type<Record<string, string>>(),
    rootCause: text("root_cause"),
    infoGap: text("info_gap"),
    sentiment: text("sentiment"),
    urgency: smallint("urgency").notNull().default(1),
    confidence: numeric("confidence", { precision: 4, scale: 3 }),
    needsReading: boolean("needs_reading").notNull().default(false),
    status: text("status").notNull().default("new"),
    deptOptional: text("dept_optional"),
    issueId: uuid("issue_id"),
    deviceHash: text("device_hash").notNull(),
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }),
    closeReason: text("close_reason"),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    uniqueIndex("submissions_ref_hash_idx").on(t.refHash),
    index("submissions_status_idx").on(t.status),
    index("submissions_issue_idx").on(t.issueId),
    index("submissions_created_idx").on(t.createdAt),
  ],
);

/** الخط الزمني الظاهر للموظف — سطر لكل انتقال حالة */
export const submissionEvents = pgTable(
  "submission_events",
  {
    id: id(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    state: text("state").notNull(),
    note: text("note"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("submission_events_submission_idx").on(t.submissionId)],
);

export const issues = pgTable(
  "issues",
  {
    id: id(),
    title: text("title").notNull(),
    titleNorm: text("title_norm").notNull(),
    topic: text("topic").notNull(),
    weight: integer("weight").notNull().default(0),
    status: text("status").notNull().default("open"),
    owner: text("owner"),
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }),
    answerId: uuid("answer_id"),
    needsReview: boolean("needs_review").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("issues_topic_idx").on(t.topic), index("issues_weight_idx").on(t.weight)],
);

export const issueVotes = pgTable(
  "issue_votes",
  {
    issueId: uuid("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    deviceHash: text("device_hash").notNull(),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.issueId, t.deviceHash] })],
);

/** الإجابة المعتمدة — المصدر إلزامي في المخطط نفسه */
export const answers = pgTable("answers", {
  id: id(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  answer: text("answer").notNull(),
  source: text("source").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }).notNull().defaultNow(),
});

export const escalations = pgTable("escalations", {
  id: id(),
  issueId: uuid("issue_id")
    .notNull()
    .references(() => issues.id, { onDelete: "cascade" }),
  toTeam: text("to_team").notNull(),
  questionText: text("question_text").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
  slaDueAt: timestamp("sla_due_at", { withTimezone: true }).notNull(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  outcome: text("outcome"),
});

export const rumors = pgTable(
  "rumors",
  {
    id: id(),
    claimNorm: text("claim_norm").notNull(),
    claimText: text("claim_text").notNull(),
    count: integer("count").notNull().default(1),
    /** waiting | false | true | partly — لا خامس لها */
    verdict: text("verdict").notNull().default("waiting"),
    officialText: text("official_text"),
    sourceHint: text("source_hint"),
    verdictAt: timestamp("verdict_at", { withTimezone: true }),
    published: boolean("published").notNull().default(false),
    needsReview: boolean("needs_review").notNull().default(false),
    needsEscalation: boolean("needs_escalation").notNull().default(false),
    slaDueAt: timestamp("sla_due_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("rumors_claim_norm_idx").on(t.claimNorm)],
);

export const faqs = pgTable(
  "faqs",
  {
    id: id(),
    question: text("question").notNull(),
    answer: text("answer"),
    source: text("source"),
    topic: text("topic").notNull(),
    status: text("status").notNull().default("new"),
    interestCount: integer("interest_count").notNull().default(0),
    issueId: uuid("issue_id"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("faqs_issue_idx").on(t.issueId), index("faqs_topic_idx").on(t.topic)],
);

/** بطاقة بلا مصدر لا تُنشر: `source NOT NULL` في المخطط */
export const knowledgeItems = pgTable("knowledge_items", {
  id: id(),
  /** known | unclear | changed */
  kind: text("kind").notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  source: text("source").notNull(),
  effectiveDate: timestamp("effective_date", { withTimezone: true }),
  supersededBy: uuid("superseded_by"),
  sort: smallint("sort").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pulseResponses = pgTable(
  "pulse_responses",
  {
    id: id(),
    week: text("week").notNull(),
    clarity: smallint("clarity_1_5").notNull(),
    oneThingText: text("one_thing_text"),
    deviceHash: text("device_hash").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("pulse_week_device_idx").on(t.week, t.deviceHash)],
);

/** المجاميع الأسبوعية — ما يراه الموظف هو ما تراه الإدارة */
export const pulseWeeks = pgTable("pulse_weeks", {
  week: text("week").primaryKey(),
  /** مؤشر وضوح التحول = (متوسط ÷ ٥) × ١٠٠ */
  clarityIndex: numeric("clarity_index", { precision: 5, scale: 1 }),
  sample: integer("sample").notNull().default(0),
  published: boolean("published").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const journeyStages = pgTable("journey_stages", {
  id: id(),
  sort: smallint("sort").notNull(),
  title: text("title").notNull(),
  /** done | current | upcoming */
  state: text("state").notNull(),
  whatHappens: text("what_happens").notNull(),
  employeeAction: text("employee_action").notNull(),
  openQuestions: jsonb("open_questions").$type<string[]>().notNull().default([]),
});

/** إلحاقي فقط — لا تعديل ولا حذف */
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actorRole: text("actor_role").notNull(),
    action: text("action").notNull(),
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    before: jsonb("before"),
    after: jsonb("after"),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_at_idx").on(t.at)],
);

/** تحديد المعدّل بمعرّف الجهاز — لا بالـ IP */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

