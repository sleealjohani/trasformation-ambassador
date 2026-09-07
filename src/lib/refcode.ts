/**
 * رمز المتابعة: ٨ خانات من أبجدية بلا حروف ملتبسة (بدون O/0/I/1).
 * يُخزَّن `sha256(code + PEPPER)` فقط، ولا يُعرض الرمز إلا مرة واحدة.
 * يعمل في المتصفح وعلى الخادم (WebCrypto في الطرفين).
 */
export const REF_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const REF_LENGTH = 8;

const REF_RE = new RegExp(`^[${REF_ALPHABET}]{${REF_LENGTH}}$`);

export function generateRefCode(random: (n: number) => Uint8Array = randomBytes): string {
  const bytes = random(REF_LENGTH);
  let code = "";
  for (let i = 0; i < REF_LENGTH; i += 1) {
    code += REF_ALPHABET[(bytes[i] ?? 0) % REF_ALPHABET.length];
  }
  return code;
}

function randomBytes(n: number): Uint8Array {
  const bytes = new Uint8Array(n);
  globalThis.crypto.getRandomValues(bytes);
  return bytes;
}

/** يقبل ما يكتبه الموظف بحروف صغيرة أو مع مسافات وشرطات. لا يخمّن حروفًا ملتبسة. */
export function normalizeRefCode(input: string): string {
  return input.trim().toUpperCase().replace(/[\s-]/g, "");
}

export function isValidRefCode(code: string): boolean {
  return REF_RE.test(code);
}

export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function hashRefCode(code: string, pepper: string): Promise<string> {
  return sha256Hex(code + pepper);
}
