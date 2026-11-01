ALTER TABLE "submissions" ADD COLUMN "channel" text DEFAULT 'app' NOT NULL;--> statement-breakpoint
ALTER TABLE "submissions" ADD COLUMN "card_kind" text;--> statement-breakpoint
CREATE INDEX "submissions_channel_idx" ON "submissions" USING btree ("channel","created_at");