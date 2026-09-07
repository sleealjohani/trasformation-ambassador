import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;

/**
 * بعض بيئات التشغيل تُثبّت Chromium خارج مسار Playwright الافتراضي.
 * اضبط PLAYWRIGHT_CHROMIUM_EXECUTABLE عندها؛ وإلا يُستخدم المتصفح الذي ينزّله Playwright.
 */
const chromiumExecutable = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  ...(process.env.CI ? { workers: 1 } : {}),
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "on-first-retry",
    locale: "ar-SA",
  },
  projects: [
    {
      name: "mobile",
      // شاشة المرجع في وثيقة التصميم: ٣٩٠×٨٤٤
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        ...(chromiumExecutable ? { launchOptions: { executablePath: chromiumExecutable } } : {}),
      },
    },
  ],
  webServer: {
    command: "pnpm build && pnpm start",
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
