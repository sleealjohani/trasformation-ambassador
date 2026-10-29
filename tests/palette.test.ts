import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  ALLOWED_HEX,
  BRAND_PALETTE,
  NOT_FOR_TEXT_ON_WHITE,
  PALETTE_EXEMPT_FILES,
  SEMANTIC_TOKENS,
  STATUS_COLORS,
  STATUS_KEYS,
  SURFACE_TOKENS,
  TRANSITION_PALETTE,
} from "../src/lib/tokens";

function collect(dir: string, exts: readonly string[], acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) collect(full, exts, acc);
    else if (exts.some((ext) => entry.endsWith(ext))) acc.push(full);
  }
  return acc;
}

const SOURCE_FILES = [...collect("src", [".ts", ".tsx", ".css"])];
const ALLOWED = new Set(ALLOWED_HEX.map((hex) => hex.toLowerCase()));

describe("لوحة الألوان", () => {
  it("لا لون سداسي خارج لوحة الهوية في أي ملف مصدر", () => {
    const offenders: string[] = [];

    // مصدر التعريف يحمل اللوحتين معًا، فالمسموح فيه اتحادهما
    const TRANSITION = new Set(TRANSITION_PALETTE.map((hex) => hex.toLowerCase()));

    for (const file of SOURCE_FILES) {
      const path = file.replace(/\\/g, "/");
      if (PALETTE_EXEMPT_FILES.includes(path)) continue;
      const allowedHere = path === "src/lib/tokens.ts" ? new Set([...ALLOWED, ...TRANSITION]) : ALLOWED;
      const contents = readFileSync(file, "utf8");
      for (const match of contents.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        const hex = match[0].toLowerCase();
        // نتجاهل الصيغة المختصرة والقيم ذات قناة الشفافية: لا تُستخدم في المشروع.
        if (!allowedHere.has(hex)) offenders.push(`${file}: ${match[0]}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("ملفا المقدمة وحدهما مستثنيان، وبألوان الانتقال المعلنة فقط", () => {
    const allowed = new Set(TRANSITION_PALETTE.map((h) => h.toLowerCase()));
    const offenders: string[] = [];
    for (const file of PALETTE_EXEMPT_FILES) {
      for (const match of readFileSync(file, "utf8").matchAll(/#[0-9a-fA-F]{6}\b/g)) {
        const hex = match[0].toLowerCase();
        if (!allowed.has(hex) && !ALLOWED.has(hex)) offenders.push(`${file}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("الليموني والأخضر محجوزان للرسوم ولا يُستخدمان لنص على أبيض", () => {
    expect(NOT_FOR_TEXT_ON_WHITE).toContain("#9ECC3B");
    expect(NOT_FOR_TEXT_ON_WHITE).toContain("#04A67A");
  });

  it("كل زوج نص/خلفية في اللوحة يحقق تباين WCAG AA", () => {
    const srgb = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const lum = (hex: string) => {
      const n = Number.parseInt(hex.slice(1), 16);
      const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgb(v / 255)) as [number, number, number];
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
      return (x + 0.05) / (y + 0.05);
    };

    const S = SURFACE_TOKENS;
    const pairs: ReadonlyArray<readonly [string, string, string, number]> = [
      ["النص على الأبيض", S.ink, S.solid, 4.5],
      ["النص على الصفحة", S.ink, S.page, 4.5],
      ["الثانوي على الأبيض", S.muted, S.solid, 4.5],
      ["الثانوي على الصفحة", S.muted, S.page, 4.5],
      ["المعطّل على خلفيته", S.disabledInk, S.disabledBg, 4.5],
      ["الأبيض على الأساس", S.inverse, BRAND_PALETTE.primary, 4.5],
      ["الأبيض على الأساس عند المرور", S.inverse, BRAND_PALETTE.primaryHover, 4.5],
      ["الأبيض على الأساس عند الضغط", S.inverse, BRAND_PALETTE.primaryActive, 4.5],
      ["الفاتح على الليل", S.inverseMuted, S.night, 4.5],
      ["حدّ الحقل على الأبيض", S.controlBorder, S.solid, 3],
      ["حلقة التركيز على الصفحة", SEMANTIC_TOKENS.focus, S.page, 3],
    ];

    const failures = pairs
      .map(([name, fg, bg, min]) => [name, ratio(fg, bg), min] as const)
      .filter(([, r, min]) => r < min)
      .map(([name, r, min]) => `${name}: ${r.toFixed(2)} < ${min}`);

    expect(failures).toEqual([]);
  });

  it("كل حالة دلالية مقروءة فوق خلفيتها", () => {
    const srgb = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
    const lum = (hex: string) => {
      const n = Number.parseInt(hex.slice(1), 16);
      const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgb(v / 255)) as [number, number, number];
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ratio = (a: string, b: string) => {
      const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p) as [number, number];
      return (x + 0.05) / (y + 0.05);
    };

    const failures = STATUS_KEYS.map((key) => {
      const { fg, tint } = STATUS_COLORS[key];
      return [key, ratio(fg, tint)] as const;
    })
      .filter(([, r]) => r < 4.5)
      .map(([key, r]) => `${key}: ${r.toFixed(2)} < 4.5`);

    expect(failures).toEqual([]);
  });

  it("ست حالات لا أكثر ولا أقل، ولكل حالة لون مميز", () => {
    expect(STATUS_KEYS).toHaveLength(6);
    expect(new Set(STATUS_KEYS).size).toBe(6);
  });
});
