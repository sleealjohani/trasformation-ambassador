import { describe, expect, it } from "vitest";
import { REF_ALPHABET, generateRefCode, hashRefCode, isValidRefCode, normalizeRefCode } from "../src/lib/refcode";

describe("رمز المتابعة", () => {
  it("ثماني خانات من الأبجدية بلا حروف ملتبسة", () => {
    for (let i = 0; i < 200; i += 1) {
      const code = generateRefCode();
      expect(code).toHaveLength(8);
      expect(isValidRefCode(code)).toBe(true);
      expect(code).not.toMatch(/[O0I1]/);
    }
  });

  it("الأبجدية ٣٢ حرفًا", () => {
    expect(REF_ALPHABET).toHaveLength(32);
    expect(new Set(REF_ALPHABET).size).toBe(32);
  });

  it("التلبيد ثابت ويتغيّر بتغيّر المِلح", async () => {
    const a = await hashRefCode("J7K4M2QP", "pepper-a");
    const b = await hashRefCode("J7K4M2QP", "pepper-a");
    const c = await hashRefCode("J7K4M2QP", "pepper-b");
    expect(a).toBe(b);
    expect(a).not.toBe(c);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(a).not.toContain("J7K4M2QP");
  });

  it("يقبل ما يكتبه الموظف بحروف صغيرة ومسافات", () => {
    expect(normalizeRefCode(" j7k4 m2qp ")).toBe("J7K4M2QP");
    expect(isValidRefCode(normalizeRefCode("j7k4-m2qp"))).toBe(true);
    expect(isValidRefCode(normalizeRefCode("J7K4M2Q0"))).toBe(false);
  });
});
