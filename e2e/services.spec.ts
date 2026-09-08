import { test, expect } from "./fixtures";

/** الخدمات القرائية تفتح ممتلئة من البذر — لا شاشة فارغة عند أول فتح. */
test.describe("المحتوى المزروع", () => {
  test("القضايا الحيّة والتصويت", async ({ page }) => {
    await page.goto("/issues");
    await expect(page.getByRole("heading", { name: "القضايا الحيّة" })).toBeVisible();
    const cards = page.getByRole("article");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThan(0);

    const vote = page.getByRole("button", { name: "هذا يشغلني أيضًا" }).first();
    await vote.click();
    await expect(page.getByRole("button", { name: "سُجّل اهتمامك" }).first()).toBeVisible();
  });

  test("جسر المعرفة بتبويباته الثلاثة وبمصدر لكل بطاقة", async ({ page }) => {
    await page.goto("/knowledge");
    await expect(page.getByText("استمرارية صرف الرواتب")).toBeVisible();
    await expect(page.getByText("المصدر: تعميم فريق التحول").first()).toBeVisible();

    await page.getByRole("link", { name: "لم يتضح" }).click();
    await expect(page.getByText("لم يصدر توضيح رسمي حتى الآن.").first()).toBeVisible();

    await page.getByRole("link", { name: "ما الذي تغيّر" }).click();
    await expect(page.getByText("صار الآن")).toBeVisible();
  });

  test("الأسئلة تعرض المُجاب وغير المُجاب بحالته", async ({ page }) => {
    await page.goto("/answers");
    await expect(page.getByText("تُحتسب مدة الخدمة السابقة كما هي، ولا يترتب على الانتقال إعادة احتسابها.")).toBeVisible();
    const unanswered = page.locator("li").filter({ hasText: "متى تبدأ مرحلة الانتقال الفعلي؟" }).first();
    await expect(unanswered).toContainText("لم يصدر توضيح رسمي حتى الآن.");
  });

  test("البحث بلا نتيجة يفتح المحادثة بالنص المكتوب", async ({ page }) => {
    await page.goto("/answers");
    await page.getByLabel("ابحث في الأسئلة").fill("موضوع لا وجود له إطلاقًا");
    await page.getByRole("button", { name: "اطرح هذا السؤال" }).click();
    await expect(page).toHaveURL(/\/ask\?gate=question&t=/);
    await expect(page.getByLabel("اكتب بحرّية — الحقل مفتوح دائمًا")).toHaveValue("موضوع لا وجود له إطلاقًا");
  });

  test("سمعت أن… تعرض المواقف المعتمدة فقط وتستقبل ادّعاء جديدًا", async ({ page }) => {
    await page.goto("/rumors");
    await expect(page.getByText("«ستتوقف البدلات بعد التحول»")).toBeVisible();
    await expect(page.getByText("غير صحيح").first()).toBeVisible();
    await expect(page.getByText("«ستُعاد صياغة جميع العقود خلال شهر»")).toBeVisible();
    await expect(page.getByText("بانتظار توضيح رسمي").first()).toBeVisible();

    await page.getByLabel("اكتب أي معلومة سمعتها عن التحول، حتى لو لم تكن متأكدًا من صحتها.").fill("سمعت أن الدوام سيتغير بعد التحول");
    await page.getByRole("button", { name: "أرسل ما سمعته" }).click();
    // لا يعيد أي حالة نشر
    await expect(page.getByText("لا يُنشر أي موقف قبل اعتماده رسميًا.")).toBeVisible();
  });

  test("رحلة التحول تُظهر المرحلة الحالية", async ({ page }) => {
    await page.goto("/journey");
    const current = page.locator('[aria-current="step"]');
    await expect(current).toContainText("الاستعداد");
    await expect(current).toContainText("نحن هنا الآن");
  });

  test("النبض يعرض الاتجاه ويقبل ردًا واحدًا", async ({ page }) => {
    await page.goto("/pulse");
    await expect(page.getByRole("heading", { name: "الاتجاه" })).toBeVisible();
    await page.getByRole("radio", { name: /متوسط/ }).click();
    await page.getByRole("button", { name: "أرسل ردّي" }).click();
    await expect(page.getByRole("heading", { name: "وصل ردّك" })).toBeVisible();
    // العيّنة دون ٢٠ ⟶ لا تُعلن النتيجة
    await expect(page.getByText("العيّنة غير كافية لإعلان النتيجة هذا الأسبوع.")).toBeVisible();
  });
});
