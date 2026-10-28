"use client";

import { SOUND_KEY, readLocal, writeLocal } from "./storage";

export const SOUND_MAX_MS = 3000;
export function isSoundOn(): boolean { return readLocal<boolean>(SOUND_KEY) !== false; }
export function setSoundOn(on: boolean): void { writeLocal(SOUND_KEY, on); }

export function playSubmitSuccess(): void {
  if (!isSoundOn()) return;
  try {
    const audio = new Audio("/sound/sonic-logo-short.mp3");
    audio.volume = 0.38;
    void audio.play().then(() => {
      window.setTimeout(() => { audio.pause(); audio.currentTime = 0; }, SOUND_MAX_MS);
    }).catch(() => undefined);
  } catch { /* لا صوت */ }
}
