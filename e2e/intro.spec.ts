import { expect, test } from "@playwright/test";

/**
 * مشهد الافتتاح — بلا الحيلة التي تتخطّاه في بقية الاختبارات.
 * يتحقق من التسلسل ومن أنه ينصرف ويترك الواجهة قابلة للاستخدام.
 */
test.describe("مقدمة جسر التحول", () => {
  test("تمرّ بمراحل التحول ثم تنصرف وتترك الرئيسية جاهزة", async ({ page }) => {
    await page.goto("/");

    const intro = page.locator(".intro");
    await expect(intro).toBeVisible();
    await expect(intro).toHaveAttribute("data-phase", "old");

    // علامة وزارة الصحة ثم علامة الصحة القابضة
    await expect(page.locator('img[src="/brand/moh-mark.svg"]').first()).toBeVisible();
    await expect(intro).toHaveAttribute("data-phase", "hold", { timeout: 6000 });
    await expect(page.locator('img[src="/brand/hh-mark.svg"]').first()).toBeVisible();
    await expect(page.locator(".intro__promise")).toHaveText("اسأل • شارك • افهم • تابع");

    // تنصرف وحدها وتترك الواجهة قابلة للاستخدام
    await expect(intro).toBeHidden({ timeout: 8000 });
    await page.getByText("عندي مخاوف", { exact: true }).click();
    await expect(page).toHaveURL(/\/ask\?gate=concern/);
  });

  test("زر التخطّي ينهيها فورًا، ولا تعود في الجلسة نفسها", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "تخطٍّ" }).click();
    await expect(page.locator(".intro")).toBeHidden();

    // التنقل داخل الجلسة لا يعيد المشهد
    await page.goto("/issues");
    await expect(page.locator(".intro")).toHaveCount(0);
  });

  test("مفتاح الصوت معروض وقابل للكتم", async ({ page }) => {
    await page.goto("/");
    const mute = page.getByRole("button", { name: "كتم الصوت" });
    await expect(mute).toBeVisible();
    await mute.click();
    await expect(page.getByRole("button", { name: "تشغيل الصوت" })).toBeVisible();
    await expect(page.locator("audio")).toHaveJSProperty("paused", true);
  });

  test("النشيد مرفق وقابل للتحميل", async ({ page }) => {
    const res = await page.request.get("/sound/anthem.mp3");
    expect(res.status()).toBe(200);
    expect(Number(res.headers()["content-length"] ?? 0)).toBeGreaterThan(100_000);
  });
});
