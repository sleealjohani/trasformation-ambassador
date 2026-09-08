"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { OFFICIAL_SHORTS } from "@/content/official";

const VIDEO_VOLUME = 0.72;

export function ShortsFeed() {
  const videos = useRef(new Map<string, HTMLVideoElement>());
  const activeId = useRef<string | null>(null);
  const [needsTap, setNeedsTap] = useState(false);

  const playActive = useCallback(async () => {
    const id = activeId.current;
    if (!id) return;
    const target = videos.current.get(id);
    if (!target) return;
    for (const [videoId, video] of videos.current) {
      if (videoId !== id) video.pause();
    }
    target.muted = false;
    target.volume = VIDEO_VOLUME;
    try {
      await target.play();
      setNeedsTap(false);
    } catch {
      // iOS وبعض المتصفحات تمنع autoplay بصوت؛ أول لمسة لاحقة تعيد المحاولة.
      setNeedsTap(true);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible || visible.intersectionRatio < 0.62) return;
        const id = (visible.target as HTMLElement).dataset.shortId ?? null;
        activeId.current = id;
        void playActive();
      },
      { threshold: [0.35, 0.62, 0.85] },
    );

    const cards = document.querySelectorAll<HTMLElement>("[data-short-id]");
    cards.forEach((card) => observer.observe(card));
    const retry = () => void playActive();
    window.addEventListener("pointerdown", retry, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("pointerdown", retry);
      videos.current.forEach((video) => video.pause());
    };
  }, [playActive]);

  return (
    <ol className="v2-short-feed" aria-label="مختصرات التحول">
      {OFFICIAL_SHORTS.map((item, index) => {
        const src: string | null = item.localSrc;
        return (
          <li key={item.id} data-short-id={item.id} className="v2-short-card flex flex-col justify-end p-5">
            {src ? (
              <video
                ref={(node) => {
                  if (node) videos.current.set(item.id, node);
                  else videos.current.delete(item.id);
                }}
                className="v2-short-video"
                src={src}
                controls
                playsInline
                loop
                preload={index === 0 ? "auto" : "metadata"}
                onPlay={() => {
                  activeId.current = item.id;
                  for (const [videoId, video] of videos.current) if (videoId !== item.id) video.pause();
                }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center" aria-hidden>
                <div className="flex size-20 items-center justify-center rounded-tag border border-panel/20 bg-panel/10 text-panel"><Icon name="video" size={30} /></div>
              </div>
            )}
            <div className="v2-short-shade" aria-hidden />
            <div className="relative z-10 mb-3 flex items-center justify-between gap-3"><span className="rounded-tag border border-panel/20 bg-panel/10 px-3 py-1 text-tag font-bold">{item.eyebrow}</span><span className="text-tag text-on-dark">{index + 1}/{OFFICIAL_SHORTS.length}</span></div>
            <div className="relative z-10">
              <h2 className="max-w-[360px] text-[25px] font-bold leading-[1.55] text-panel">{item.title}</h2>
              <p className="mt-2 max-w-[360px] text-body text-on-dark">{item.summary}</p>
              {!src ? <p className="mt-3 rounded-button border border-panel/20 bg-panel/10 p-3 text-secondary text-on-dark">النسخة التجريبية تعرض المصدر بدون تحميل أي محتوى خارجي. أول ما نستلم ملف MP4 المعتمد، يشتغل هنا مباشرة.</p> : null}
              {src && needsTap && activeId.current === item.id ? <button type="button" onClick={() => void playActive()} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-tag bg-panel px-4 text-secondary font-bold text-night"><Icon name="volume" size={16} />اضغط لتشغيل صوت المقطع</button> : null}
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-tag bg-panel px-4 text-secondary font-bold text-night"><Icon name="info" size={15} />المصدر الرسمي</a>
            </div>
            <div className="relative z-10 mt-5 text-center text-tag text-on-dark">اسحب للأعلى للمقطع اللي بعده ↑</div>
          </li>
        );
      })}
    </ol>
  );
}
