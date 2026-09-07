import { describe, expect, it } from "vitest";
import { REDACTION_MARK, mentionsPerson, redact } from "../src/lib/redact";

describe("التنقية — كل نمط على حدة", () => {
  it("البريد الإلكتروني", () => {
    const r = redact("راسلوني على someone@example.com لو سمحتم");
    expect(r.clean).not.toContain("example.com");
    expect(r.hits.map((h) => h.kind)).toContain("email");
  });

  it("الجوال بصيغه المحلية", () => {
    for (const phone of ["0551234567", "055 123 4567", "+966551234567", "00966551234567", "٠٥٥١٢٣٤٥٦٧"]) {
      const r = redact(`جوالي ${phone} تواصلوا معي`);
      expect(r.clean, phone).not.toMatch(/\d{4,}/);
      expect(r.clean, phone).toContain(REDACTION_MARK);
    }
  });

  it("الرقم الوظيفي بصيغه الشائعة", () => {
    for (const s of ["رقمي الوظيفي 45821", "الرقم الوظيفي: 45821", "emp id 45821", "ID# 45821"]) {
      const r = redact(s);
      expect(r.clean, s).not.toContain("45821");
    }
  });

  it("أي رقم من ٤ خانات فأكثر", () => {
    const r = redact("رقم الهوية 1098765432 وحسابي 12-34-56-78");
    expect(r.clean).not.toMatch(/\d{4,}/);
    expect(r.clean).not.toContain("12-34-56-78");
  });

  it("أنماط «اسمي … / أنا …»", () => {
    expect(redact("اسمي محمد العتيبي وعندي سؤال").clean).toBe(`${REDACTION_MARK} وعندي سؤال`);
    expect(redact("أنا فاطمة من القسم").clean).toContain(REDACTION_MARK);
  });

  it("لا تحذف «أنا» حين تليها صفة لا اسم", () => {
    const r = redact("أنا قلق من موضوع العقود");
    expect(r.clean).toBe("أنا قلق من موضوع العقود");
    expect(r.hits).toHaveLength(0);
  });

  it("تُبقي الأرقام القصيرة المفيدة (٧ أيام، ٣ أشهر)", () => {
    const r = redact("سمعت أن التحول خلال ٣ أشهر وبعدها ٧ أيام");
    expect(r.hits).toHaveLength(0);
  });

  it("النص الأصلي لا يظهر في المخرج ولا يُحفظ", () => {
    const original = "اسمي سعد وجوالي 0501234567 وبريدي saad@example.com";
    const r = redact(original);
    expect(r.clean).not.toContain("سعد");
    expect(r.clean).not.toContain("0501234567");
    expect(r.clean).not.toContain("saad@");
    expect(JSON.stringify(r)).not.toContain("0501234567");
  });
});

describe("رصد اسم شخص في الشائعات", () => {
  it("لقب يليه اسم يُحجب", () => {
    expect(mentionsPerson("سمعت أن الدكتور خالد بيتنقل")).toBe(true);
    expect(mentionsPerson("ستتوقف البدلات بعد التحول")).toBe(false);
  });
});
