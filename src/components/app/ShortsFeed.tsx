"use client";

import { Icon } from "@/components/ui/Icon";
import { OFFICIAL_SHORTS } from "@/content/official";

export function ShortsFeed() {
  return <ol className="v2-short-feed" aria-label="مختصرات التحول">{OFFICIAL_SHORTS.map((item, index) => {
    const src = item.localSrc;
    return <li key={item.id} className="v2-short-card flex flex-col justify-end p-5">
      {src ? <video className="v2-short-video" src={src} controls playsInline preload="metadata" /> : <div className="absolute inset-0 flex items-center justify-center" aria-hidden><div className="flex size-20 items-center justify-center rounded-tag border border-panel/20 bg-panel/10 text-panel"><Icon name="video" size={30} /></div></div>}
      <div className="v2-short-shade" aria-hidden />
      <div className="relative z-10 mb-3 flex items-center justify-between gap-3"><span className="rounded-tag border border-panel/20 bg-panel/10 px-3 py-1 text-tag font-bold">{item.eyebrow}</span><span className="text-tag text-on-dark">{index + 1}/{OFFICIAL_SHORTS.length}</span></div>
      <div className="relative z-10"><h2 className="max-w-[360px] text-[25px] font-bold leading-[1.55] text-panel">{item.title}</h2><p className="mt-2 max-w-[360px] text-body text-on-dark">{item.summary}</p>{!src ? <p className="mt-3 rounded-button border border-panel/20 bg-panel/10 p-3 text-secondary text-on-dark">في النسخة التجريبية نعرض المصدر بدون تحميله خارجيًا. بعد استلام ملف MP4 المعتمد، يشتغل هنا مباشرة بصوت الفيديو.</p> : null}<a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-tag bg-panel px-4 text-secondary font-bold text-night"><Icon name="info" size={15} />المصدر الرسمي</a></div>
      <div className="relative z-10 mt-5 text-center text-tag text-on-dark">اسحب للأعلى للمقطع اللي بعده ↑</div>
    </li>;
  })}</ol>;
}
