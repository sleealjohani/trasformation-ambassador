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
INSERT INTO "media_items" ("slug", "title", "source_label", "media_url", "published", "sort") VALUES
  ('employee-journey', 'اعرف أكثر عن التحول ورحلة انتقال الموظف', 'تجمع الشرقية الصحي · الصحة القابضة', '/media/short-employee-journey.mp4', true, 0),
  ('joining-benefits', 'أهم مزايا الانضمام للمنتقلين من الخدمة المدنية', 'تجمع الشرقية الصحي · الصحة القابضة', '/media/short-joining-benefits.mp4', true, 1),
  ('we-transform', 'بكم نتميز', 'تجمع الشرقية الصحي · الصحة القابضة', '/media/short-we-transform.mp4', true, 2)
ON CONFLICT ("slug") DO NOTHING;--> statement-breakpoint
DO $$
BEGIN
  IF to_regclass('storage.buckets') IS NOT NULL THEN
    EXECUTE $bucket$
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
        allowed_mime_types = EXCLUDED.allowed_mime_types
    $bucket$;
  END IF;
END $$;
