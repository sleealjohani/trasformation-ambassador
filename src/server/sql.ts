import { sql } from "drizzle-orm";

/**
 * وسيط زمني بنوع صريح.
 * postgres-js لا يستنتج نوع الوسيط داخل عبارات SQL الخام، فيصل نصًّا بلا نوع ويفشل الاستعلام.
 */
export function ts(date: Date) {
  return sql`${date.toISOString()}::timestamptz`;
}
