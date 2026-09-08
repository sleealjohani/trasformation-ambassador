import { defineConfig } from "drizzle-kit";
import "./db/env";

/** الترحيلات على الاتصال المباشر (منفذ 5432)، والتطبيق على الـ pooler. */
export default defineConfig({
  dialect: "postgresql",
  schema: ["./db/schema.ts", "./db/media-schema.ts"],
  out: "./db/migrations",
  dbCredentials: { url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "" },
  strict: true,
  verbose: true,
});
