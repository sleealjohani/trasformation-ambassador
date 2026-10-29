import { expect, test } from "./fixtures";

/**
 * التباين فوق الزجاج لا يُقاس بألوان CSS المحسوبة: الأسطح شفّافة ويرشح خلفها
 * مشهد متغيّر اللمعان، فلا يعرف `getComputedStyle` ما يقع تحت النص فعلًا.
 *
 * لذلك نقيس البكسل المرسوم: نُخفي كل نص، نلتقط الخلفية الصافية، ثم نحسب
 * نسبة كل لون نص مقابل متوسط ما تحته.
 */
const PAGES = ["/", "/issues", "/ask", "/knowledge", "/track"] as const;

test("كل نص يحقق عتبة WCAG AA فوق ما يقع تحته فعلًا", async ({ page }) => {
  const failures: string[] = [];

  for (const path of PAGES) {
    await page.goto(path);
    for (const scrollY of [0, 900]) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollY);
      await page.waitForTimeout(350);

      const items = await page.evaluate(() => {
        const out: { t: string; x: number; y: number; w: number; h: number; c: [number, number, number]; size: number; bold: boolean }[] = [];
        for (const el of document.querySelectorAll("p,h1,h2,h3,b,span,a,button,label,li")) {
          const text = (el.textContent ?? "").trim();
          if (text.length < 2) continue;
          if (el.children.length > 0 && ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent?.trim())) continue;
          const cs = getComputedStyle(el);
          if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.95) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 6 || r.height < 6) continue;
          if (r.top < 2 || r.bottom > window.innerHeight - 2 || r.left < 2 || r.right > window.innerWidth - 2) continue;
          const m = cs.color.match(/[\d.]+/g);
          if (!m || m.length < 3) continue;
          out.push({
            t: text.slice(0, 30),
            x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
            c: [Number(m[0]), Number(m[1]), Number(m[2])],
            size: Number.parseFloat(cs.fontSize),
            bold: Number.parseInt(cs.fontWeight, 10) >= 700,
          });
        }
        return out;
      });

      const hide = await page.addStyleTag({ content: "*{color:transparent !important;text-shadow:none !important}" });
      await page.waitForTimeout(200);
      const shot = await page.screenshot();
      await hide.evaluate((n) => { (n as unknown as Element).remove(); });

      const bad = await page.evaluate(
        async ({ b64, items, dpr }) => {
          const img = new Image();
          img.src = "data:image/png;base64," + b64;
          await img.decode();
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) return [];
          ctx.drawImage(img, 0, 0);
          const lum = (r: number, g: number, b: number) => {
            const f = (v: number) => { const n = v / 255; return n <= 0.03928 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; };
            return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
          };
          const out: string[] = [];
          for (const it of items) {
            // اللقطة بدقة الجهاز، والإحداثيات بالبكسل المنطقي: تُضرب في النسبة
            const sx = Math.max(0, Math.round(it.x * dpr)), sy = Math.max(0, Math.round(it.y * dpr));
            const sw = Math.min(Math.round(it.w * dpr), canvas.width - sx);
            const sh = Math.min(Math.round(it.h * dpr), canvas.height - sy);
            if (sw < 4 || sh < 4) continue;
            const d = ctx.getImageData(sx, sy, sw, sh).data;
            let r = 0, g = 0, b = 0, n = 0;
            for (let i = 0; i < d.length; i += 4) { r += d[i] ?? 0; g += d[i + 1] ?? 0; b += d[i + 2] ?? 0; n++; }
            const l1 = lum(it.c[0], it.c[1], it.c[2]);
            const l2 = lum(r / n, g / n, b / n);
            const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
            const min = it.size >= 24 || (it.size >= 18.66 && it.bold) ? 3 : 4.5;
            if (ratio < min) out.push(`${ratio.toFixed(2)} < ${min} · ${it.size}px · «${it.t}»`);
          }
          return out;
        },
        { b64: shot.toString("base64"), items, dpr: await page.evaluate(() => window.devicePixelRatio) },
      );

      for (const line of bad) failures.push(`${path} @${scrollY}: ${line}`);
    }
  }

  expect(failures).toEqual([]);
});
