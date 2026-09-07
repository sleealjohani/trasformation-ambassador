import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * عميل قاعدة البيانات — للخادم فقط.
 * لا يُستورد هذا الملف من أي مكوّن عميل، ولا تُنادى القاعدة من المتصفح.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL غير مضبوط.");
}

const client = postgres(connectionString ?? "", { prepare: false });

export const db = drizzle(client, { schema });
