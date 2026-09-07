import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { FORBIDDEN_COLUMN_PATTERNS } from "../db/schema";

/**
 * حارس الخصوصية: المخطط لا يحتوي عمودًا يعرّف بشخص.
 * هذا الاختبار جزء من CI ويجب أن يبقى أخضر في كل مرحلة.
 */
describe("مخطط قاعدة البيانات", () => {
  const schemaSource = readFileSync("db/schema.ts", "utf8");

  // نفحص تعريفات الأعمدة فقط، لا قائمة الأنماط المحظورة نفسها.
  const columnDefinitions = schemaSource
    .split("\n")
    .filter((line) => /\b(text|varchar|integer|uuid|timestamp|boolean|numeric|jsonb|vector)\(/.test(line))
    .join("\n");

  it.each(FORBIDDEN_COLUMN_PATTERNS.map((pattern) => [pattern.source, pattern] as const))(
    "لا عمود يطابق %s",
    (_source, pattern) => {
      expect(columnDefinitions).not.toMatch(pattern);
    },
  );

  it("لا جدول باسم users أو employees أو accounts", () => {
    expect(schemaSource).not.toMatch(/pgTable\(\s*["'](users|employees|accounts|profiles)["']/);
  });
});
