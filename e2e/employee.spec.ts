import { test, expect } from "./fixtures";

test("مسار الموظف المبسط من المشاركة إلى المتابعة", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "وش بخاطرك عن التحول؟", level: 1 })).toBeVisible();
  await expect(page.getByText("اسأل، شارك اللي مقلقك، اقترح، وتابع الرد — بدون اسمك.")).toBeVisible();
  await page.getByText("فيه شيء مقلقني", { exact: true }).click();
  await expect(page).toHaveURL(/\/ask\?gate=concern/);
  await expect(page.getByText("وش أكثر شيء مقلقك أو شاغل بالك عن التحول؟")).toBeVisible();
  await page.getByLabel("اكتب مشاركتك").fill("قلق على عقدي بعد التحول، وجوالي 0551234567 لو احتجتم التواصل");
  await page.getByRole("button", { name: "راجع وأرسل" }).click();
  await expect(page).toHaveURL(/\/ask\/review/);
  const preview = page.locator("section").filter({ hasText: "هذا اللي بيروح لسفير التغيير" }).first();
  await expect(preview).not.toContainText("0551234567");
  await expect(page.getByText("شِلنا معلومة ممكن تدل عليك قبل الإرسال")).toBeVisible();
  await page.getByRole("button", { name: "إرسال المشاركة" }).click();
  await expect(page).toHaveURL(/\/ask\/done/);
  const code = (await page.getByTestId("ref-code").innerText()).trim();
  expect(code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/);
  await expect(page.getByText("احتفظ بالرمز — بتحتاجه عشان ترجع تتابع مشاركتك.")).toBeVisible();
  await page.getByRole("button", { name: "نسخ الرمز" }).click();
  await expect(page.getByRole("button", { name: "نُسخ الرمز" })).toBeVisible();
  await page.goto(`/track?code=${code}`);
  await expect(page.getByRole("heading", { name: "حالة مشاركتك" })).toBeVisible();
  await expect(page.locator('[data-status="new"]').first()).toBeVisible();
});

test("رمز خاطئ يعرض الرسالة المبسطة", async ({ page }) => { await page.goto("/track"); await page.getByLabel("أدخل رمز المتابعة").fill("ZZZZ2222"); await page.getByRole("button", { name: "تابع" }).click(); await expect(page.getByText("ما لقينا مشاركة بهذا الرمز. تأكد من الحروف والأرقام.")).toBeVisible(); });
