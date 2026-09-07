import { expect, test } from "@playwright/test";

/**
 * تحقّق دخان للمرحلة صفر: صفحة نظام التصميم تعرض المكوّنات السبعة بحالاتها،
 * والواجهة عربية باتجاه RTL.
 */
test.describe("معرض نظام التصميم", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/kitchen-sink");
  });

  test("الصفحة عربية باتجاه من اليمين إلى اليسار", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
  });

  test("الأقسام السبعة للمكوّنات ظاهرة", async ({ page }) => {
    for (const id of ["gate-card", "chat-bubble", "chip", "status-tag", "issue-card", "sheet", "bottom-tabs"]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test("وسوم الحالات الست تحمل نصًا لا لونًا وحده", async ({ page }) => {
    const tags = page.locator("#status-tag [data-status]");
    await expect(tags).toHaveCount(6);
    for (const text of await tags.allInnerTexts()) {
      expect(text.trim().length).toBeGreaterThan(0);
    }
  });

  test("اللوح السفلي يُفتح ويُغلق بالزر", async ({ page }) => {
    await page.getByRole("button", { name: "افتح اللوح" }).click();
    const sheet = page.getByRole("dialog", { name: "تأكيد الإرسال" });
    await expect(sheet).toBeVisible();
    await sheet.getByRole("button", { name: "إغلاق", exact: true }).click();
    await expect(sheet).toBeHidden();
  });

  test("كل هدف لمس لا يقل عن ٤٤×٤٤ بكسل", async ({ page }) => {
    const buttons = page.locator("main button:visible");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const box = await buttons.nth(i).boundingBox();
      if (!box) continue;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
