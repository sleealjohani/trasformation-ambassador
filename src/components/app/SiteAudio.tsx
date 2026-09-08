"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { isSoundOn, setSoundOn } from "@/lib/sound";
import { cn } from "@/lib/cn";

const AMBIENT_VOLUME = 0.16;
type SiteAudioValue = { muted: boolean; mediaMode: boolean; toggle: () => void };
const SiteAudioContext = createContext<SiteAudioValue | null>(null);

export function SiteAudioProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [muted, setMuted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const mediaMode = pathname.startsWith("/videos");

  /* eslint-disable react-hooks/set-state-in-effect -- مزامنة تفضيل محفوظ على الجهاز بعد الترطيب */
  useEffect(() => { setMuted(!isSoundOn()); setHydrated(true); }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = AMBIENT_VOLUME;
    if (muted || mediaMode || document.visibilityState === "hidden") { audio.pause(); return; }
    let cancelled = false;
    const attempt = () => { if (!cancelled && !muted && !mediaMode) { audio.volume = AMBIENT_VOLUME; void audio.play().catch(() => undefined); } };
    attempt();
    const onGesture = () => attempt();
    window.addEventListener("pointerdown", onGesture, { once: true });
    window.addEventListener("keydown", onGesture, { once: true });
    return () => { cancelled = true; window.removeEventListener("pointerdown", onGesture); window.removeEventListener("keydown", onGesture); };
  }, [hydrated, muted, mediaMode]);

  useEffect(() => {
    const onVisibility = () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (document.visibilityState === "hidden" || muted || mediaMode) audio.pause();
      else { audio.volume = AMBIENT_VOLUME; void audio.play().catch(() => undefined); }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [muted, mediaMode]);

  const value = useMemo<SiteAudioValue>(() => ({ muted, mediaMode, toggle: () => {
    const next = !muted;
    setMuted(next);
    setSoundOn(!next);
    const audio = audioRef.current;
    if (next) audio?.pause();
    else if (!mediaMode && audio) { audio.volume = AMBIENT_VOLUME; void audio.play().catch(() => undefined); }
  } }), [muted, mediaMode]);

  return <SiteAudioContext.Provider value={value}><audio ref={audioRef} data-site-ambient src="/sound/anthem.mp3" preload="auto" loop playsInline />{children}</SiteAudioContext.Provider>;
}

export function useSiteAudio(): SiteAudioValue {
  const value = useContext(SiteAudioContext);
  if (!value) throw new Error("useSiteAudio must be used inside SiteAudioProvider");
  return value;
}

export function SoundToggle({ className, showText = false }: { className?: string; showText?: boolean }) {
  const { muted, mediaMode, toggle } = useSiteAudio();
  const label = muted ? "تشغيل الصوت" : "كتم الصوت";
  const help = mediaMode && !muted ? "صوت الخلفية متوقف أثناء المقاطع" : label;
  return <button type="button" onClick={toggle} aria-label={label} aria-pressed={!muted} title={help} className={cn(className ?? "v2-sound-toggle", "inline-flex items-center justify-center gap-2")}><Icon name={muted || mediaMode ? "mute" : "volume"} size={17} />{showText ? <span>{label}</span> : null}</button>;
}
