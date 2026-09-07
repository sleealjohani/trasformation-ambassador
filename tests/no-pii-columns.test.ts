import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

/**
 * حارس الخصوصية: المخطط لا يحتوي عمودًا يعرّف بشخص.
 * السكربت نفسه يعمل في CI؛ الاختبار يضمن أنه يمرّ وأنه يرصد المخالفة فعلًا.
 */
describe("مخطط قاعدة البيانات", () => {
  it("السكربت يمرّ على المخطط الحالي", () => {
    const out = execFileSync("node", ["scripts/check-schema.mjs"], { encoding: "utf8" });
    expect(out).toContain("✓");
  });

  it("لا جدول للهوية ولا عمود اسم أو بريد أو جوال", () => {
    const source = readFileSync("db/schema.ts", "utf8");
    expect(source).not.toMatch(/pgTable\(\s*["'](users|employees|accounts|profiles)["']/);
    const columns = source.split("\n").filter((l) => /\b(text|varchar|integer|uuid)\(/.test(l)).join("\n");
    for (const re of [/\bname\b/i, /\bemail\b/i, /\bphone\b/i, /\bmobile\b/i, /\bemployee_?id\b/i, /\bnational_?id\b/i, /\biqama\b/i]) {
      expect(columns).not.toMatch(re);
    }
  });

  it("device_hash لا يُخزَّن إلا مُلبّدًا — لا عمود للقيمة الخام", () => {
    const source = readFileSync("db/schema.ts", "utf8");
    expect(source).not.toMatch(/device_(seed|raw|id)\b/);
  });
});
