// يبني بطاقة «سؤالك يفتح الحوار» من مصدرها:
//   ١ · يخبز خلفية الغلاف (مكان ← إضاءة ← جسر) بدقة ٣٠٠dpi، ونسخة مموّهة منها للزجاج.
//   ٢ · يطبع البطاقة PDF بمقاس A4 أفقي + نزف ٣مم، والنص والشعاران متجهات.
//   ٣ · يرسم معاينة PNG من ملف الـPDF نفسه (pdftoppm) لا من الصفحة.
// التشغيل من جذر المستودع:  node docs/print/build.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT = path.join(HERE, "out");
const ASSETS = path.join(HERE, "assets");
const MM = 96 / 25.4; // CSS px per mm
const DSF = 300 / 96; // 300dpi

const TYPES = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".webp": "image/webp", ".jpg": "image/jpeg", ".png": "image/png", ".woff2": "font/woff2", ".mjs": "text/javascript" };

// خادم محلي: اللوحة لا تقرأ بكسلات صورة من file:// (أصل معتم)، فنخدم المستودع عبر HTTP.
const server = createServer(async (req, res) => {
  const rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
  const file = path.join(ROOT, rel);
  if (!file.startsWith(ROOT)) return res.writeHead(403).end();
  try {
    const body = await readFile(file);
    res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const BASE = `http://127.0.0.1:${server.address().port}/docs/print`;

const browser = await chromium.launch(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {});
try {
  // ── ١ · الخبز ──
  const cover = { width: 151.5 * MM, height: 216 * MM };
  const bake = await browser.newPage({ viewport: { width: Math.ceil(cover.width), height: Math.ceil(cover.height) }, deviceScaleFactor: DSF });
  await bake.goto(`${BASE}/bake-cover.html`);
  await bake.evaluate(() => window.bakeReady);
  const clip = { x: 0, y: 0, ...cover };
  await bake.screenshot({ path: path.join(ASSETS, "cover-bg.jpg"), type: "jpeg", quality: 90, clip });
  await bake.evaluate(() => document.body.classList.add("frost-mode"));
  await bake.screenshot({ path: path.join(ASSETS, "cover-frost.jpg"), type: "jpeg", quality: 88, clip });
  await bake.close();

  // ── ٢ · الطباعة ──
  const card = await browser.newPage({ viewport: { width: Math.ceil(303 * MM), height: Math.ceil(216 * MM) } });
  await card.emulateMedia({ media: "print" });
  await card.goto(`${BASE}/question-card.html`, { waitUntil: "networkidle" });
  await card.evaluate(async () => { await document.fonts.ready; window.alignFrost(); });
  const pdf = path.join(OUT, "question-card-print.pdf");
  await card.pdf({ path: pdf, preferCSSPageSize: true, printBackground: true });
  await card.close();

  // ── ٣ · المعاينة من الـPDF نفسه، مقصوصة عند حدّ القص (دون النزف) ──
  const r = 200, bleed = Math.round((3 / 25.4) * r);
  const w = Math.round((297 / 25.4) * r), h = Math.round((210 / 25.4) * r);
  execFileSync("pdftoppm", ["-r", String(r), "-png", "-singlefile", "-x", String(bleed), "-y", String(bleed), "-W", String(w), "-H", String(h), pdf, path.join(OUT, "question-card-preview")]);
  console.log("built:", path.relative(ROOT, pdf), "+ question-card-preview.png");
} finally {
  await browser.close();
  server.close();
}
