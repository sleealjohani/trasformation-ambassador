import { describe, expect, it } from "vitest";
import { IllegalTransitionError, addBusinessDays, canTransition, slaDueFor, toVisibleStatus, transition } from "../src/lib/state";

describe("آلة الحالات", () => {
  it("المسار الرئيسي كاملًا مسموح", () => {
    let s = transition("new", "reviewed");
    s = transition(s, "needs_referral");
    s = transition(s, "referred");
    s = transition(s, "answered");
    s = transition(s, "published");
    expect(s).toBe("published");
  });

  it("انتقال ممنوع يُرفض", () => {
    expect(() => transition("new", "answered")).toThrow(IllegalTransitionError);
    expect(() => transition("published", "new")).toThrow(IllegalTransitionError);
    expect(() => transition("deleted_by_author", "reviewed")).toThrow(IllegalTransitionError);
    expect(canTransition("referred", "new")).toBe(false);
  });

  it("الحذف بالرمز متاح من كل حالة عدا المحذوفة", () => {
    expect(canTransition("published", "deleted_by_author")).toBe(true);
    expect(canTransition("deleted_by_author", "deleted_by_author")).toBe(false);
  });

  it("الحالة الظاهرة للموظف — تجاوز SLA يظهر تصعيدًا", () => {
    expect(toVisibleStatus("referred")).toBe("referred");
    expect(toVisibleStatus("referred", true)).toBe("escalated");
    expect(toVisibleStatus("needs_referral")).toBe("waiting");
    expect(toVisibleStatus("published")).toBe("answered");
  });

  it("أيام العمل تتخطى الجمعة والسبت", () => {
    const thursday = new Date(Date.UTC(2026, 8, 3)); // الخميس
    const due = addBusinessDays(thursday, 1);
    expect(due.getUTCDay()).toBe(0); // الأحد
  });

  it("سقوف SLA", () => {
    const at = new Date(Date.UTC(2026, 8, 6, 8));
    expect(slaDueFor("new", at)?.getTime()).toBe(at.getTime() + 24 * 3_600_000);
    expect(slaDueFor("needs_referral", at)?.getTime()).toBe(at.getTime() + 48 * 3_600_000);
    expect(slaDueFor("answered", at)).toBeNull();
  });
});
