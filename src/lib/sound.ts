"use client";

import { SOUND_KEY, readLocal, writeLocal } from "./storage";

/**
 * الصوت في المنصة موضعان لا ثالث لهما:
 *  ١. نشيد الهوية في مقدمة الافتتاح — يعمل تلقائيًا بقرار صاحب المنتج، ومفتاح الكتم
 *     ظاهر في المقدمة نفسها ويُحفظ الاختيار على الجهاز.
 *  ٢. نغمة ≤ ٣ ثوانٍ عند نجاح الإرسال — لا شيء غيرها في أي مسار.
 * ولا صوت إطلاقًا في لوحة سفير التغيير ولا مع الأخطاء.
 */
export const SOUND_MAX_MS = 3000;

export function isSoundOn(): boolean {
  return readLocal<boolean>(SOUND_KEY) !== false;
}

export function setSoundOn(on: boolean): void {
  writeLocal(SOUND_KEY, on);
}

/** لا صوت إن كان الجهاز صامتًا: التشغيل يفشل بصمت ولا نتجاوز مستوى صوت النظام. */
export function playSubmitSuccess(): void {
  if (!isSoundOn()) return;
  try {
    const audio = new Audio("/sound/sonic-logo-short.mp3");
    audio.volume = 1;
    void audio.play().then(() => {
      window.setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, SOUND_MAX_MS);
    }).catch(() => undefined);
  } catch {
    // لا صوت
  }
}
