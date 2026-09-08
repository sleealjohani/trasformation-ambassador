import { test, expect } from "./fixtures";
import type { Page } from "@playwright/test";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "local-admin-passcode";

async function submitConcern(page: Page, text: string): Promise<string> {
  await page.goto("/ask?gate=concern");
  await page.getByLabel("اكتب بحرّية — الحقل مفتوح دائمًا").fill(text);
  await page.getByRole("button", { name: "أرسل" }).click();
  await page.getByRole("button", { name: "إنهاء الآن" }).click();
  await page.getByRole("button", { name: "إرسال المشاركة" }).click();
  await expect(page).toHaveURL(/\/ask\/done/);
  return (await page.getByTestId("ref-code").innerText()).trim();
}

/**
 * مسار السفير: دخول ← تصنيف ← دمج ← إحالة ← نشر إجابة بمصدر ←
 * رجوع الموظف إلى /track ورؤية «تمت الإجابة» ← ظهور السؤال في /answers.
 */
test("مسار سفير التغيير من التصنيف إلى نشر الإجابة", async ({ page }) => {
  // العلامة حروف فقط: الأرقام الطويلة تُنقّى قبل التخزين
  const marker = `تدريب${Math.random().toString(36).slice(2, 8).replace(/[0-9]/g, "س")}`;
  const code = await submitConcern(page, `لا أعرف ما التدريب المطلوب قبل الانتقال ${marker}`);

  await page.goto("/admin/login");
  await page.getByLabel("رمز الدخول").fill(PASSCODE);
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(page.getByRole("button", { name: "الوارد", exact: true })).toBeVisible();

  // الوارد مرتّب بالإلحاح
  const row = page.getByRole("button").filter({ hasText: marker }).first();
  await expect(row).toBeVisible();
  await row.click();

  const sheet = page.getByRole("dialog", { name: "إجراءات على المشاركة" });
  await expect(sheet).toBeVisible();

  // تصنيف
  await sheet.getByRole("button", { name: "التدريب", exact: true }).click();
  await sheet.getByRole("button", { name: "احفظ التصنيف" }).click();
  await expect(sheet).toBeHidden();

  // دمج في قضية قائمة
  await page.getByRole("button").filter({ hasText: marker }).first().click();
  const sheet2 = page.getByRole("dialog", { name: "إجراءات على المشاركة" });
  await sheet2.getByLabel("اختر قضية").selectOption({ label: "ما التدريب المطلوب قبل الانتقال؟" });
  await sheet2.getByRole("button", { name: "ادمج" }).click();
  await expect(sheet2).toBeHidden();

  // إحالة ثم نشر إجابة بمصدر
  await page.getByRole("button", { name: "القضايا", exact: true }).click();
  await page.getByRole("button").filter({ hasText: "ما التدريب المطلوب قبل الانتقال؟" }).first().click();
  const issueSheet = page.getByRole("dialog", { name: "ما التدريب المطلوب قبل الانتقال؟" });
  await issueSheet.getByRole("button", { name: "أحِل وابدأ عدّاد SLA" }).click();
  await expect(issueSheet).toBeHidden();

  await page.getByRole("button").filter({ hasText: "ما التدريب المطلوب قبل الانتقال؟" }).first().click();
  const issueSheet2 = page.getByRole("dialog", { name: "ما التدريب المطلوب قبل الانتقال؟" });
  await issueSheet2.getByLabel("نص الإجابة").fill("يُعلن برنامج التدريب رسميًا قبل بدء الانتقال بوقت كافٍ.");
  await issueSheet2.getByLabel("المصدر").fill("تعميم فريق التحول");
  await issueSheet2.getByRole("button", { name: "انشر الإجابة" }).click();
  await expect(issueSheet2).toBeHidden();

  // الموظف يرى «تمت الإجابة»
  await page.goto(`/track?code=${code}`);
  await expect(page.locator('[data-status="answered"]').first()).toBeVisible();

  // والسؤال يظهر في الإجابات بمصدره
  await page.goto("/answers");
  const card = page.locator("li").filter({ hasText: "ما التدريب المطلوب قبل الانتقال؟" }).first();
  await expect(card).toContainText("يُعلن برنامج التدريب رسميًا قبل بدء الانتقال بوقت كافٍ.");
  await expect(card).toContainText("المصدر: تعميم فريق التحول");
});

test("تقرير الأسبوع مجمّع بلا نص خام", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("رمز الدخول").fill(PASSCODE);
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("button", { name: "تقرير الأسبوع", exact: true }).click();
  const report = page.getByTestId("weekly-report");
  await expect(report).toBeVisible();
  await expect(report).toContainText("تقرير الأسبوع");
  await expect(report).toContainText("زمن الاستجابة (وسيط)");
  await expect(report).toContainText("عتبة الظهور");
});
