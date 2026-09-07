import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ALLOWED_HEX, NOT_FOR_TEXT_ON_WHITE, STATUS_KEYS } from "../src/lib/tokens";

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

    for (const file of SOURCE_FILES) {
      const contents = readFileSync(file, "utf8");
      for (const match of contents.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
        const hex = match[0].toLowerCase();
        // نتجاهل الصيغة المختصرة والقيم ذات قناة الشفافية: لا تُستخدم في المشروع.
        if (!ALLOWED.has(hex)) offenders.push(`${file}: ${match[0]}`);
      }
    }

    expect(offenders).toEqual([]);
  });

  it("الأزرقان الأساسيان محجوزان للأسطح ولا يُستخدمان لنص", () => {
    expect(NOT_FOR_TEXT_ON_WHITE).toContain("#2FA9E0");
    expect(NOT_FOR_TEXT_ON_WHITE).toContain("#1691D0");
  });

  it("ست حالات لا أكثر ولا أقل، ولكل حالة لون مميز", () => {
    expect(STATUS_KEYS).toHaveLength(6);
    expect(new Set(STATUS_KEYS).size).toBe(6);
  });
});
