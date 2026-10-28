#!/usr/bin/env node
/**
 * حارس الخصوصية في CI: يفشل البناء إن ظهر في أي ملف *schema.ts داخل db عمود يعرّف بشخص.
 */
import { readFileSync, readdirSync } from "node:fs";

const FORBIDDEN = [
  /\bname\b/i,
  /\bfull_?name\b/i,
  /\bemployee_?(id|number|no)\b/i,
  /\bemail\b/i,
  /\bphone\b/i,
  /\bmobile\b/i,
  /\bnational_?id\b/i,
  /\biqama\b/i,
  /\bip_?address\b/i,
  /\buser_?agent\b/i,
];

const files = readdirSync("db").filter((file) => file.endsWith("schema.ts"));
const source = files.map((file) => readFileSync(`db/${file}`, "utf8")).join("\n");
// نفحص تعريفات الأعمدة والجداول فقط، لا التعليقات
const code = source
  .split("\n")
  .filter((line) => !line.trim().startsWith("*") && !line.trim().startsWith("//") && !line.trim().startsWith("/**"))
  .filter((line) => /\b(text|varchar|integer|uuid|timestamp|boolean|numeric|jsonb|smallint|pgTable)\(/.test(line))
  .join("\n");

const offenders = FORBIDDEN.filter((re) => re.test(code));
if (offenders.length > 0) {
  console.error("✗ المخطط يحتوي عمودًا محظورًا:", offenders.map((r) => r.source).join(", "));
  process.exit(1);
}
console.log(`✓ لا عمود يعرّف بشخص في ${files.join(", ")}`);
