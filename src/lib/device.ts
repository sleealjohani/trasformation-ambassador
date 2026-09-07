/**
 * معرّف الجهاز — يعمل في المتصفح فقط.
 * قيمة عشوائية تُولَّد محليًا، تُجدَّد كل ٣٠ يومًا، وتُرسل ملبّدة فقط.
 * لا تعرّف بشخص، وتُستخدم لمنع التكرار وتحديد المعدّل.
 */
import { sha256Hex } from "./refcode";

const KEY = "bridge:device";
const ROTATE_MS = 30 * 24 * 3_600_000;

type Stored = { seed: string; createdAt: number };

function randomSeed(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function read(): Stored | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Stored).seed === "string" &&
      typeof (parsed as Stored).createdAt === "number"
    ) {
      return parsed as Stored;
    }
    return null;
  } catch {
    return null;
  }
}

/** يعيد تلبيد المعرّف الحالي، ويجدّده إن تجاوز ٣٠ يومًا. */
export async function getDeviceHash(): Promise<string> {
  let stored = read();
  const now = Date.now();
  if (!stored || now - stored.createdAt > ROTATE_MS) {
    stored = { seed: randomSeed(), createdAt: now };
    try {
      localStorage.setItem(KEY, JSON.stringify(stored));
    } catch {
      // وضع خاص أو تخزين معطّل: يبقى المعرّف للجلسة فقط
    }
  }
  return sha256Hex(stored.seed);
}
