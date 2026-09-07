import { describe, expect, it } from "vitest";
import { toArabicDecimal, toArabicDigits } from "../src/lib/numerals";

describe("الأرقام العربية-الهندية", () => {
  it("تحوّل الأرقام اللاتينية", () => {
    expect(toArabicDigits(2026)).toBe("٢٠٢٦");
    expect(toArabicDigits("7 أيام عمل")).toBe("٧ أيام عمل");
  });

  it("تستخدم الفاصلة العشرية العربية", () => {
    expect(toArabicDecimal(1.5)).toBe("١٫٥");
  });
});
