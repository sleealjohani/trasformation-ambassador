import { readFileSync, statSync } from "node:fs";
import { describe, expect, it } from "vitest";

/** الخط جزء من الهوية: الملفان المعتمدان يجب أن يكونا حاضرين وبصيغة woff2. */
const WEIGHTS = [
  ["public/fonts/JannaLT-Regular.woff2", 400],
  ["public/fonts/JannaLT-Bold.woff2", 700],
] as const;

describe("خطوط Janna LT", () => {
  it.each(WEIGHTS)("%s موجود وبصيغة woff2", (path) => {
    const buf = readFileSync(path);
    // توقيع wOF2
    expect(buf.subarray(0, 4).toString("latin1")).toBe("wOF2");
    expect(statSync(path).size).toBeGreaterThan(10_000);
  });

  it("لا وزن ثالث ولا local() ولا شبكة خارجية في @font-face", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const faces = css.match(/@font-face\s*\{[^}]*\}/g) ?? [];
    expect(faces).toHaveLength(2);

    const weights = faces.map((f) => f.match(/font-weight:\s*(\d+)/)?.[1]);
    expect(weights).toEqual(["400", "700"]);

    for (const face of faces) {
      expect(face).not.toMatch(/local\(/);
      expect(face).not.toMatch(/https?:/);
      expect(face).toMatch(/url\("\/fonts\/JannaLT-(Regular|Bold)\.woff2"\)/);
    }
  });
});
