import { boolean, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * مكتبة الميديا التي يتحكم بها سفير التغيير.
 * لا تحتوي أي بيانات موظفين أو معرّفات شخصية.
 */
export const mediaItems = pgTable(
  "media_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    sourceLabel: text("source_label").notNull(),
    sourceUrl: text("source_url"),
    mediaUrl: text("media_url").notNull(),
    storagePath: text("storage_path"),
    published: boolean("published").notNull().default(false),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("media_items_slug_idx").on(t.slug),
    index("media_items_published_sort_idx").on(t.published, t.sort),
  ],
);
