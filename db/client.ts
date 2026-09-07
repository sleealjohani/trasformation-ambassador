import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * عميل قاعدة البيانات — للخادم فقط.
 * لا يُستورد من أي مكوّن عميل، ولا تُنادى القاعدة من المتصفح.
 * الاتصال عبر الـ pooler (منفذ 6543) في الإنتاج؛ لذلك `prepare: false`.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL غير مضبوط. انسخ .env.example إلى .env.local واملأه.");
}

declare global {
  var __bridgeSql: ReturnType<typeof postgres> | undefined;
}

const client = globalThis.__bridgeSql ?? postgres(connectionString, { prepare: false, max: 5 });
if (process.env.NODE_ENV !== "production") globalThis.__bridgeSql = client;

export const db = drizzle(client, { schema });
export type Db = typeof db;
export { schema };
