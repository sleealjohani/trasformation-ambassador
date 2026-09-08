CREATE TABLE "media_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"source_label" text NOT NULL,
	"source_url" text,
	"media_url" text NOT NULL,
	"storage_path" text,
	"published" boolean DEFAULT false NOT NULL,
	"sort" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "media_items_slug_idx" ON "media_items" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "media_items_published_sort_idx" ON "media_items" USING btree ("published","sort");