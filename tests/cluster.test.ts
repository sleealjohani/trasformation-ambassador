import { describe, expect, it } from "vitest";
import { findCluster, toClusterKey } from "../src/lib/cluster";
import { jaccard, normalizeArabic, stemSet } from "../src/lib/text";

describe("تطبيع النص", () => {
  it("يوحّد الألف والهمزة والتاء المربوطة ويزيل التشكيل", () => {
    expect(normalizeArabic("الإدارةُ الأُولى")).toBe("الاداره الاولي");
  });
});

describe("التجميع", () => {
  const issues = [
    { id: "a", titleNorm: toClusterKey("ماذا سيحدث لعقود الموظفين؟") },
    { id: "b", titleNorm: toClusterKey("هل تتأثر البدلات بعد التحول؟") },
  ];

  it("نص مشابه يُدمج في القضية القائمة", () => {
    const m = findCluster("وش بيصير لعقود الموظفين", issues);
    expect(m?.id).toBe("a");
    expect(m?.similarity).toBeGreaterThanOrEqual(0.6);
  });

  it("نص مختلف يفتح قضية جديدة", () => {
    expect(findCluster("متى يبدأ التدريب على النظام الجديد؟", issues)).toBeNull();
  });

  it("Jaccard على الجذوع", () => {
    expect(jaccard(stemSet("العقود والبدلات"), stemSet("عقد وبدل"))).toBe(1);
    expect(jaccard(new Set(), new Set())).toBe(0);
  });
});
