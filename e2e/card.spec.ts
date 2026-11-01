import { test, expect } from "./fixtures";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "local-admin-passcode";
const SECRETS = { name: "اسمي عبدالله الشمري", phone: "0559876543", email: "abdullah.test@example.com", employeeId: "رقمي الوظيفي 448120" };

test("صفحة /q مستقلة: بلا مشهد افتتاح وبلا حقل هوية", async ({ page, browser }) => {
  // سياق جديد بلا علم «شوهد المشهد»: الصفحة يصلها الموظف من باركود لأول مرة
  const fresh = await browser.newContext();
  const first = await fresh.newPage();
  await first.goto("/q");
  await expect(first.getByRole("heading", { level: 1 })).toContainText("سؤالك");
  await expect(first.locator(".intro")).toHaveCount(0);
  await fresh.close();

  await page.goto("/q");
  const html = await page.content();
  expect(html).not.toMatch(/type="email"|type="tel"|autocomplete="(name|email|tel|username)"/);
  await expect(page.getByRole("navigation")).toHaveCount(0);
});

test("السؤال يصل منقّى، تظهر رسالة الشكر والرمز، ويظهر في تبويب «أسئلة الحوار»", async ({ page }) => {
  const marker = `حوار${Math.random().toString(36).slice(2, 8).replace(/[0-9]/g, "ن")}`;
  await page.goto("/q");
  await page.getByRole("radio", { name: "أبي أتأكد من معلومة سمعتها" }).check();
  await page.getByLabel("اكتبها هنا").fill(`${SECRETS.name} ${marker} سمعت إن العقود بتتغير، ${SECRETS.employeeId} وجوالي ${SECRETS.phone} وبريدي ${SECRETS.email}`);
  await page.getByRole("button", { name: "أرسل سؤالك" }).click();

  await expect(page.getByRole("heading", { name: "وصلنا سؤالك… شكرًا من القلب" })).toBeVisible();
  await expect(page.getByText("شِلنا معلومة ممكن تدل عليك قبل الإرسال")).toBeVisible();
  const code = (await page.getByTestId("ref-code").innerText()).trim();
  expect(code).toMatch(/^[A-Z2-9-]{8,9}$/);
  await expect(page.getByRole("link", { name: "تابع الرد" })).toHaveAttribute("href", `/track?code=${code}`);

  await page.goto("/admin/login");
  await page.getByLabel("رمز الدخول").fill(PASSCODE);
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await page.getByRole("tab", { name: "أسئلة الحوار" }).click();
  const list = page.getByTestId("card-questions");
  await expect(list).toContainText(marker);
  const text = await list.innerText();
  expect(text).toContain("أبي أتأكد من معلومة سمعتها");
  for (const secret of Object.values(SECRETS)) expect(text).not.toContain(secret);
});

test("واجهة /api/card ترفض أي حقل غير النوع والنص", async ({ request }) => {
  const deviceHash = "a".repeat(64);
  const res = await request.post("/api/card", { data: { kind: "question", body: "سؤال تجريبي عن التحول", deviceHash, name: "أحد" }, headers: { "x-device-hash": deviceHash } });
  expect(res.status()).toBe(400);
});
