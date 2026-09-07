CREATE TABLE "answers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"answer" text NOT NULL,
	"source" text NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_role" text NOT NULL,
	"action" text NOT NULL,
	"entity" text NOT NULL,
	"entity_id" text,
	"before" jsonb,
	"after" jsonb,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "escalations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"issue_id" uuid NOT NULL,
	"to_team" text NOT NULL,
	"question_text" text NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sla_due_at" timestamp with time zone NOT NULL,
	"closed_at" timestamp with time zone,
	"outcome" text
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text,
	"source" text,
	"topic" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"interest_count" integer DEFAULT 0 NOT NULL,
	"issue_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "issue_votes" (
	"issue_id" uuid NOT NULL,
	"device_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "issue_votes_issue_id_device_hash_pk" PRIMARY KEY("issue_id","device_hash")
);
--> statement-breakpoint
CREATE TABLE "issues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"title_norm" text NOT NULL,
	"topic" text NOT NULL,
	"weight" integer DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"owner" text,
	"sla_due_at" timestamp with time zone,
	"answer_id" uuid,
	"needs_review" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "journey_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sort" smallint NOT NULL,
	"title" text NOT NULL,
	"state" text NOT NULL,
	"what_happens" text NOT NULL,
	"employee_action" text NOT NULL,
	"open_questions" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledge_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"source" text NOT NULL,
	"effective_date" timestamp with time zone,
	"superseded_by" uuid,
	"sort" smallint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"week" text NOT NULL,
	"clarity_1_5" smallint NOT NULL,
	"one_thing_text" text,
	"device_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pulse_weeks" (
	"week" text PRIMARY KEY NOT NULL,
	"clarity_index" numeric(5, 1),
	"sample" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rumors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"claim_norm" text NOT NULL,
	"claim_text" text NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"verdict" text DEFAULT 'waiting' NOT NULL,
	"official_text" text,
	"source_hint" text,
	"verdict_at" timestamp with time zone,
	"published" boolean DEFAULT false NOT NULL,
	"needs_review" boolean DEFAULT false NOT NULL,
	"needs_escalation" boolean DEFAULT false NOT NULL,
	"sla_due_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"state" text NOT NULL,
	"note" text,
	"at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ref_hash" text NOT NULL,
	"gate" text NOT NULL,
	"type" text NOT NULL,
	"topic" text,
	"sub_topic" text,
	"body_clean" text,
	"answers_clean" jsonb,
	"root_cause" text,
	"info_gap" text,
	"sentiment" text,
	"urgency" smallint DEFAULT 1 NOT NULL,
	"confidence" numeric(4, 3),
	"needs_reading" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"dept_optional" text,
	"issue_id" uuid,
	"device_hash" text NOT NULL,
	"sla_due_at" timestamp with time zone,
	"close_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "topics" (
	"slug" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"sort" smallint NOT NULL,
	"keywords" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "answers" ADD CONSTRAINT "answers_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "escalations" ADD CONSTRAINT "escalations_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issue_votes" ADD CONSTRAINT "issue_votes_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_events" ADD CONSTRAINT "submission_events_submission_id_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_at_idx" ON "audit_log" USING btree ("at");--> statement-breakpoint
CREATE UNIQUE INDEX "faqs_issue_idx" ON "faqs" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "faqs_topic_idx" ON "faqs" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "issues_topic_idx" ON "issues" USING btree ("topic");--> statement-breakpoint
CREATE INDEX "issues_weight_idx" ON "issues" USING btree ("weight");--> statement-breakpoint
CREATE UNIQUE INDEX "pulse_week_device_idx" ON "pulse_responses" USING btree ("week","device_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "rumors_claim_norm_idx" ON "rumors" USING btree ("claim_norm");--> statement-breakpoint
CREATE INDEX "submission_events_submission_idx" ON "submission_events" USING btree ("submission_id");--> statement-breakpoint
CREATE UNIQUE INDEX "submissions_ref_hash_idx" ON "submissions" USING btree ("ref_hash");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submissions_issue_idx" ON "submissions" USING btree ("issue_id");--> statement-breakpoint
CREATE INDEX "submissions_created_idx" ON "submissions" USING btree ("created_at");