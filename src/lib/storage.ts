"use client";

/** تخزين محلي آمن — يفشل بصمت في الأوضاع الخاصة. */
export function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeLocal(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // تخزين معطّل — نكمل بلا حفظ
  }
}

export function clearLocal(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // لا شيء
  }
}

export const DRAFT_KEY = "bridge:draft";
export const OUTBOX_KEY = "bridge:outbox";
export const SOUND_KEY = "bridge:sound";
export const CODES_KEY = "bridge:codes";
