import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * عميل قاعدة البيانات — للخادم فقط.
 * لا يُستورد من أي مكوّن عميل، ولا تُنادى القاعدة من المتصفح.
 * الاتصال عبر الـ pooler (منفذ 6543) في الإنتاج؛ لذلك `prepare: false`.
 *
 * الاتصال **كسول**: لا يُقرأ DATABASE_URL ولا يُفتح اتصال إلا عند أول استعلام فعلي.
 * البناء يستورد كل وحدة مسار لجمع إعداداتها، فلو رمينا عند الاستيراد لفشل البناء
 * على أي بيئة لا تحمل المتغيّر — والبناء لا يحتاج قاعدة بيانات أصلًا.
 */
declare global {
  var __bridgeSql: ReturnType<typeof postgres> | undefined;
  var __bridgeDb: PostgresJsDatabase<typeof schema> | undefined;
}

type PostgresJsDatabase<T extends Record<string, unknown>> = ReturnType<typeof drizzle<T>>;

function connect(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL غير مضبوط. انسخ .env.example إلى .env.local واملأه.");
  }
  const client = globalThis.__bridgeSql ?? postgres(connectionString, { prepare: false, max: 5 });
  if (process.env.NODE_ENV !== "production") globalThis.__bridgeSql = client;
  return drizzle(client, { schema });
}

function getDb(): PostgresJsDatabase<typeof schema> {
  globalThis.__bridgeDb ??= connect();
  return globalThis.__bridgeDb;
}

/** واجهة drizzle نفسها، لكن الاتصال يُنشأ عند أول استخدام لا عند الاستيراد. */
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_target, property) {
    const instance = getDb();
    const value = Reflect.get(instance as object, property, instance);
    return typeof value === "function" ? value.bind(instance) : value;
  },
  has(_target, property) {
    return Reflect.has(getDb() as object, property);
  },
});

export type Db = PostgresJsDatabase<typeof schema>;
export { schema };
