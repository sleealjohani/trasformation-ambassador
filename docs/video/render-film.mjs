import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
const [,, url, outDir, fpsArg] = process.argv;
const FPS = Number(fpsArg || 30);
mkdirSync(outDir, { recursive: true });
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium',
  args:['--headless','--no-sandbox','--force-color-profile=srgb','--font-render-hinting=none','--disable-lcd-text'] });
const ctx = await b.newContext({ viewport:{width:1080,height:1920}, deviceScaleFactor:1 });
const p = await ctx.newPage();
await p.goto(url, { waitUntil:'networkidle', timeout:60000 });
await p.evaluate(()=>document.fonts.ready);
await p.waitForTimeout(600);
const DUR = await p.evaluate(()=>window.FILM_DURATION);
const total = Math.round(DUR * FPS);
const t0 = Date.now();
for (let i = 0; i < total; i++) {
  const t = i / FPS;
  await p.evaluate(x => window.seek(x), t);
  await p.screenshot({ path: `${outDir}/f${String(i).padStart(5,'0')}.png` });
  if (i % 150 === 0) process.stdout.write(`  ${i}/${total} (${((Date.now()-t0)/1000).toFixed(0)}s)\n`);
}
console.log(`اكتمل: ${total} إطارًا عند ${FPS}fps = ${(total/FPS).toFixed(2)}s`);
await b.close();
