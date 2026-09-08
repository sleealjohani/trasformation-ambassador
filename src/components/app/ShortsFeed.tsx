"use client";

import { useCallback, useEffect, useRef } from "react";
import { OFFICIAL_SHORTS } from "@/content/official";

const VIDEO_VOLUME = 0.72;

export function ShortsFeed() {
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const activeId = useRef<string | null>(null);

  const activate = useCallback(async (id: string) => {
    activeId.current = id;
    for (const [videoId, video] of videos.current) {
      if (videoId !== id) video.pause();
    }

    const target = videos.current.get(id);
    if (!target) return;
    target.volume = VIDEO_VOLUME;

    // التشغيل المرئي يبدأ دائمًا مباشرة. نحاول فتح الصوت أيضًا، وإذا منعه
    // المتصفح يبقى الفيديو شغالًا بصمت حتى أول لمسة من المستخدم.
    target.muted = true;
    try {
      await target.play();
    } catch {
      return;
    }

    try {
      target.muted = false;
      await target.play();
    } catch {
      target.muted = true;
      void target.play().catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    const videoMap = videos.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible || visible.intersectionRatio < 0.6) return;
        const id = (visible.target as HTMLElement).dataset.shortId;
        if (id) void activate(id);
      },
      { threshold: [0.35, 0.6, 0.85] },
    );

    document.querySelectorAll<HTMLElement>("[data-short-id]").forEach((card) => observer.observe(card));

    const unlockAudio = () => {
      const id = activeId.current;
      if (!id) return;
      const target = videos.current.get(id);
      if (!target) return;
      target.volume = VIDEO_VOLUME;
      target.muted = false;
      void target.play().catch(() => {
        target.muted = true;
        void target.play().catch(() => undefined);
      });
    };
    window.addEventListener("pointerdown", unlockAudio, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("pointerdown", unlockAudio);
      videoMap.forEach((video) => video.pause());
    };
  }, [activate]);

  return (
    <ol className="v2-short-feed" aria-label="مختصرات التحول">
      {OFFICIAL_SHORTS.map((item, index) => (
        <li key={item.id} data-short-id={item.id} className="v2-short-card">
          <video
            ref={(node) => {
              if (node) videos.current.set(item.id, node);
              else videos.current.delete(item.id);
            }}
            className="v2-short-video"
            src={item.localSrc ?? undefined}
            playsInline
            loop
            muted
            autoPlay={index === 0}
            preload={index === 0 ? "auto" : "metadata"}
            aria-label={item.title}
            onPlay={() => {
              activeId.current = item.id;
              for (const [videoId, video] of videos.current) {
                if (videoId !== item.id) video.pause();
              }
            }}
          />
        </li>
      ))}
    </ol>
  );
}
