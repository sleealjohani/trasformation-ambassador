import { expect, test } from "@playwright/test";

test.describe("مقدمة جسر التحول", () => {
  test("تمر بمراحل التحول ثم تترك الرئيسية جاهزة", async ({ page }) => {
    await page.goto("/");
    const intro = page.locator(".intro");
    await expect(intro).toBeVisible();
    await expect(intro).toHaveAttribute("data-phase", "old");
    await expect(page.locator('img[src="/brand/moh-mark.svg"]').first()).toBeVisible();
    await expect(intro).toHaveAttribute("data-phase", "hold", { timeout: 6000 });
    await expect(page.locator('img[src="/brand/hh-mark.svg"]').first()).toBeVisible();
    await expect(page.locator(".intro__promise")).toHaveText("اسأل • شارك • افهم • تابع");
    await expect(intro).toBeHidden({ timeout: 8000 });
    await page.getByText("فيه شيء مقلقني", { exact: true }).click();
    await expect(page).toHaveURL(/\/ask\?gate=concern/);
  });

  test("زر التخطّي ينهيها ولا تعود في الجلسة", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "تخطٍّ" }).click();
    await expect(page.locator(".intro")).toBeHidden();
    await page.goto("/issues");
    await expect(page.locator(".intro")).toHaveCount(0);
  });

  test("مفتاح الصوت معروض وقابل للكتم", async ({ page }) => {
    await page.goto("/");
    const mute = page.getByRole("button", { name: "كتم الصوت" }).first();
    await expect(mute).toBeVisible();
    await mute.click();
    await expect(page.getByRole("button", { name: "تشغيل الصوت" }).first()).toBeVisible();
    await expect(page.locator("audio[data-site-ambient]")).toHaveJSProperty("paused", true);
  });

  test("صوت الخلفية يوقف للمختصرات ويرجع بعد الخروج", async ({ page }) => {
    await page.addInitScript(() => sessionStorage.setItem("bridge:intro-seen", "1"));
    await page.goto("/");
    const ambient = page.locator("audio[data-site-ambient]");

    // نقرة المستخدم تضمن السماح بالتشغيل حتى في المتصفحات التي تمنع autoplay بصوت.
    const mute = page.getByRole("button", { name: "كتم الصوت" }).first();
    await mute.click();
    await page.getByRole("button", { name: "تشغيل الصوت" }).first().click();
    await expect.poll(() => ambient.evaluate((el: HTMLAudioElement) => el.paused)).toBe(false);

    const nav = page.getByRole("navigation", { name: "التنقل الرئيسي" });
    await nav.getByRole("link", { name: /مختصرات/ }).click();
    await expect(page).toHaveURL(/\/videos/);
    await expect.poll(() => ambient.evaluate((el: HTMLAudioElement) => el.paused)).toBe(true);

    await page.getByRole("navigation", { name: "التنقل الرئيسي" }).getByRole("link", { name: /الرئيسية/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect.poll(() => ambient.evaluate((el: HTMLAudioElement) => el.paused)).toBe(false);
  });

  test("النشيد مرفق وقابل للتحميل", async ({ page }) => {
    const res = await page.request.get("/sound/anthem.mp3");
    expect(res.status()).toBe(200);
    expect(Number(res.headers()["content-length"] ?? 0)).toBeGreaterThan(100_000);
  });
});
