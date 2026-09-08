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
CREATE INDEX "media_items_published_sort_idx" ON "media_items" USING btree ("published","sort");--> statement-breakpoint
ALTER TABLE "media_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bridge-media',
  'bridge-media',
  true,
  104857600,
  ARRAY['video/mp4','video/webm','video/quicktime']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
