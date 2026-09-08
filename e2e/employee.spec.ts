import { test, expect } from "./fixtures";

/**
 * مسار الموظف: الرئيسية ← بوابة «عندي مخاوف» ← نص يحوي رقم جوال ←
 * إشعار التنقية ← الإرسال ← نسخ الرمز ← /track ← الحالة «جديدة».
 */
test("مسار الموظف من البوابة إلى المتابعة", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "جسر التحول", level: 1 })).toBeVisible();
  await expect(page.getByText("التحول يبدأ بالوضوح — اسأل، شارك مخاوفك، اطرح تحدياتك، وتابع الإجابات.")).toBeVisible();

  await page.getByText("عندي مخاوف", { exact: true }).click();
  await expect(page).toHaveURL(/\/ask\?gate=concern/);
  await expect(page.getByText("ما أكثر شيء يقلقك بشأن التحول؟")).toBeVisible();

  await page.getByLabel("اكتب بحرّية — الحقل مفتوح دائمًا").fill("قلق على عقدي بعد التحول، وجوالي 0551234567 لو احتجتم التواصل");
  await page.getByRole("button", { name: "أرسل" }).click();

  await page.getByRole("button", { name: "إنهاء الآن" }).click();
  await expect(page).toHaveURL(/\/ask\/review/);

  // ما سيصل حرفيًا: بلا رقم الجوال، ومع إشعار التنقية
  const preview = page.getByRole("region", { name: "هذا ما سيصل حرفيًا" }).or(page.locator("section").filter({ hasText: "هذا ما سيصل حرفيًا" }).first());
  await expect(preview).not.toContainText("0551234567");
  await expect(page.getByText("أزلنا معلومة قد تدلّ عليك")).toBeVisible();

  await page.getByRole("button", { name: "إرسال المشاركة" }).click();
  await expect(page).toHaveURL(/\/ask\/done/);

  const code = (await page.getByTestId("ref-code").innerText()).trim();
  expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
  await expect(page.getByText("احفظ الرمز — لا يمكن استرجاعه إذا فُقد.")).toBeVisible();

  await page.getByRole("button", { name: "نسخ الرمز" }).click();
  await expect(page.getByRole("button", { name: "نُسخ الرمز" })).toBeVisible();

  await page.goto(`/track?code=${code}`);
  await expect(page.getByRole("heading", { name: "حالة مشاركتك" })).toBeVisible();
  await expect(page.locator('[data-status="new"]').first()).toBeVisible();
});

test("رمز خاطئ يعرض النص المعتمد", async ({ page }) => {
  await page.goto("/track");
  await page.getByLabel("أدخل رمز المتابعة").fill("ZZZZ2222");
  await page.getByRole("button", { name: "تابع" }).click();
  await expect(page.getByText("لا توجد مشاركة بهذا الرمز. تحقّق من الحروف والأرقام.")).toBeVisible();
});
