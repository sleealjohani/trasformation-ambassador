#!/usr/bin/env node
/**
 * ميزانية الأداء: الحزمة الأولى (JavaScript المشترك لكل صفحة) < ١٨٠KB مضغوطة.
 * يُشغَّل بعد `pnpm build`.
 */
import { gzipSync } from "node:zlib";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const BUDGET_KB = 180;
const NEXT_DIR = ".next";

const manifest = JSON.parse(readFileSync(join(NEXT_DIR, "build-manifest.json"), "utf8"));
const files = [...(manifest.polyfillFiles ?? []), ...(manifest.rootMainFiles ?? [])];

if (files.length === 0) {
  console.error("لم يُعثر على ملفات الحزمة الأولى — شغّل `pnpm build` أولًا.");
  process.exit(1);
}

let total = 0;
for (const file of files) {
  const bytes = gzipSync(readFileSync(join(NEXT_DIR, file))).byteLength;
  total += bytes;
  console.log(`${(bytes / 1024).toFixed(1).padStart(7)} KB  ${file}`);
}

const totalKb = total / 1024;
console.log(`${"-".repeat(48)}\n${totalKb.toFixed(1).padStart(7)} KB  الإجمالي (الميزانية ${BUDGET_KB}KB)`);

if (totalKb > BUDGET_KB) {
  console.error(`\n✗ تجاوزت الحزمة الأولى الميزانية بـ ${(totalKb - BUDGET_KB).toFixed(1)}KB.`);
  process.exit(1);
}
console.log("\n✓ ضمن الميزانية.");
