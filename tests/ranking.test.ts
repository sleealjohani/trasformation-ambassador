import { describe, expect, it } from "vitest";
import { applyVisibilityThreshold, clarityIndex, computeIssueWeight, computeUrgencyScore, isoWeek, median, previousIsoWeeks } from "../src/lib/ranking";

describe("الإلحاح والوزن", () => {
  const now = new Date("2026-09-07T12:00:00Z");

  it("الإلحاح = 0.5×تكرار + 0.3×حداثة + 0.2×قلق", () => {
    const s = computeUrgencyScore({ repeat: 10, maxRepeat: 10, createdAt: now, now, urgency: 5 });
    expect(s).toBe(1);
    const old = computeUrgencyScore({ repeat: 0, maxRepeat: 10, createdAt: new Date("2026-08-01T00:00:00Z"), now, urgency: 1 });
    expect(old).toBe(0);
  });

  it("الأحدث أعلى إلحاحًا عند تساوي الباقي", () => {
    const fresh = computeUrgencyScore({ repeat: 1, maxRepeat: 5, createdAt: now, now, urgency: 2 });
    const stale = computeUrgencyScore({ repeat: 1, maxRepeat: 5, createdAt: new Date(now.getTime() - 3 * 86_400_000), now, urgency: 2 });
    expect(fresh).toBeGreaterThan(stale);
  });

  it("وزن القضية الأسبوعي", () => {
    expect(computeIssueWeight(12, 7)).toBe(19);
  });
});

describe("عتبة الظهور ٧", () => {
  it("تُخفي أي تقسيم دون ٧ وتجمعه في «أخرى» إن بلغ العتبة مجتمعًا", () => {
    const rows = [
      { key: "a", count: 12 },
      { key: "b", count: 6 },
      { key: "c", count: 3 },
    ];
    expect(applyVisibilityThreshold(rows)).toEqual([
      { key: "a", count: 12 },
      { key: "other", count: 9 },
    ]);
  });

  it("لا «أخرى» إن لم تبلغ العتبة", () => {
    expect(applyVisibilityThreshold([{ key: "a", count: 2 }, { key: "b", count: 3 }])).toEqual([]);
  });
});

describe("النبض", () => {
  it("مؤشر الوضوح = (متوسط ÷ ٥) × ١٠٠", () => {
    expect(clarityIndex(3.7)).toBe(74);
  });

  it("الوسيط لا المتوسط", () => {
    expect(median([1, 100, 3])).toBe(3);
    expect(median([1, 2, 3, 4])).toBe(2.5);
    expect(median([])).toBeNull();
  });

  it("مفتاح الأسبوع بصيغة ISO", () => {
    expect(isoWeek(new Date("2026-09-07T00:00:00Z"))).toBe("2026-W37");
    expect(previousIsoWeeks(new Date("2026-09-07T00:00:00Z"), 2)).toEqual(["2026-W35", "2026-W36"]);
  });
});
