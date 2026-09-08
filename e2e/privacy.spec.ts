import { test, expect } from "./fixtures";

const PASSCODE = process.env.ADMIN_PASSCODE ?? "local-admin-passcode";
const SECRETS = { name: "اسمي عبدالله الشمري", phone: "0559876543", email: "abdullah.test@example.com", employeeId: "رقمي الوظيفي 448120", nationalId: "1098765432" };

test("لا تصل أي بيانات معرِّفة إلى التخزين ولا إلى أي شاشة", async ({ page }) => {
  const marker = `شكوى${Math.random().toString(36).slice(2, 8).replace(/[0-9]/g, "ن")}`;
  const raw = `${SECRETS.name} ${marker}، ${SECRETS.employeeId}، جوالي ${SECRETS.phone} وبريدي ${SECRETS.email} وهويتي ${SECRETS.nationalId}`;
  await page.goto("/ask?gate=question"); await page.getByLabel("اكتب مشاركتك").fill(raw); await page.getByRole("button", { name: "راجع وأرسل" }).click(); await expect(page).toHaveURL(/\/ask\/review/);
  const review = await page.locator("main").innerText(); for (const secret of Object.values(SECRETS)) expect(review).not.toContain(secret); await expect(page.getByText("شِلنا معلومة ممكن تدل عليك قبل الإرسال")).toBeVisible();
  await page.getByRole("button", { name: "إرسال المشاركة" }).click(); await expect(page).toHaveURL(/\/ask\/done/); const code = (await page.getByTestId("ref-code").innerText()).trim();
  const track = await page.request.get(`/api/track/${code}`, { headers: { "x-device-hash": "0".repeat(64) } }); const trackBody = JSON.stringify(await track.json()); for (const secret of Object.values(SECRETS)) expect(trackBody).not.toContain(secret);
  await page.goto("/admin/login"); await page.getByLabel("رمز الدخول").fill(PASSCODE); await page.getByRole("button", { name: "دخول" }).click(); await expect(page).toHaveURL(/\/admin$/);
  const inbox = await page.locator("main").innerText(); expect(inbox).toContain(marker); expect(inbox).toContain("معلومة معرِّفة أُزيلت"); for (const secret of Object.values(SECRETS)) expect(inbox).not.toContain(secret);
  await page.getByRole("button", { name: "تقرير الأسبوع", exact: true }).click(); const report = await page.getByTestId("weekly-report").innerText(); for (const secret of Object.values(SECRETS)) expect(report).not.toContain(secret); expect(report).not.toContain(marker); expect(report).toContain("مجمّع بالكامل");
});

test("واجهة الموظف بلا حقل هوية وبلا تسجيل دخول", async ({ page }) => { for (const path of ["/", "/share", "/ask?gate=question", "/track", "/issues", "/rumors", "/pulse", "/videos"]) { await page.goto(path); const html = await page.content(); expect(html).not.toMatch(/type="email"/); expect(html).not.toMatch(/type="tel"/); expect(html).not.toMatch(/autocomplete="(name|email|tel|username)"/); expect(html).not.toMatch(/name="(employee_?id|national_?id|iqama)"/i); } });

test("لا تحليلات طرف ثالث ولا مورد خارجي في واجهة الموظف", async ({ page }) => { const external: string[] = []; page.on("request", (req) => { const url = new URL(req.url()); if (url.hostname !== "127.0.0.1" && url.hostname !== "localhost") external.push(req.url()); }); for (const path of ["/", "/info", "/videos", "/answers"]) await page.goto(path); expect(external).toEqual([]); });
