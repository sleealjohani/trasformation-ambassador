import { test as base, expect } from "@playwright/test";

/**
 * تتخطّى الاختبارات مشهد الافتتاح: هو يغطي الشاشة أربع ثوانٍ ويمنع اللمس،
 * وقد رأيناه في اختباره الخاص. العلم نفسه الذي يستخدمه التطبيق.
 */
export const test = base.extend({
  // اسم المعامل ليس `use` تفاديًا لالتباسه بخطّاف React الذي يحمل الاسم نفسه
  page: async ({ page }, runTest) => {
    await page.addInitScript(() => {
      try {
        sessionStorage.setItem("bridge:intro-seen", "1");
      } catch {
        // وضع خاص — المشهد سيظهر، وتتكفّل الاختبارات بالانتظار
      }
    });
    await runTest(page);
  },
});

export { expect };
