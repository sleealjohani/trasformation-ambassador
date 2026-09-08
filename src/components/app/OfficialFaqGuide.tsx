"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon, type IconName } from "@/components/ui/Icon";
import { OFFICIAL_ANSWERS, OFFICIAL_FAQ_URL, OFFICIAL_TOPICS, type OfficialTopicSlug } from "@/content/official";

const TOPIC_ICON: Record<OfficialTopicSlug, IconName> = { salary: "wallet", contract: "copy", service: "clock", benefits: "spark", leave: "journey", qiwa: "track", transformation: "knowledge" };

export function OfficialFaqGuide() {
  const params = useSearchParams();
  const initial = params.get("topic") as OfficialTopicSlug | null;
  const [topic, setTopic] = useState<OfficialTopicSlug | null>(OFFICIAL_TOPICS.some((t) => t.slug === initial) ? initial : null);
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return OFFICIAL_ANSWERS.filter((item) => {
      if (topic && item.topic !== topic) return false;
      if (!q) return true;
      return `${item.question} ${item.shortAnswer} ${item.keywords.join(" ")}`.toLowerCase().includes(q);
    });
  }, [topic, query]);

  return <div className="flex flex-col gap-5">
    <div className="flex flex-col gap-2"><label htmlFor="official-search" className="text-secondary font-bold text-ink-soft">وش تدور عليه؟</label><input id="official-search" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-12 rounded-button border border-line bg-panel px-4 text-body outline-none focus-visible:border-hh-2736" placeholder="مثلاً: راتبي، خدمتي، قوى…" /></div>
    <div className="grid grid-cols-2 gap-2" role="group" aria-label="مواضيع المعلومات الرسمية">{OFFICIAL_TOPICS.map((item) => <button key={item.slug} type="button" aria-pressed={topic === item.slug} onClick={() => setTopic(topic === item.slug ? null : item.slug)} className={topic === item.slug ? "flex min-h-16 items-center gap-2 rounded-card border border-hh-2736 bg-tint p-3 text-start text-hh-2736" : "surface-raise flex min-h-16 items-center gap-2 rounded-card p-3 text-start text-ink-soft"}><Icon name={TOPIC_ICON[item.slug]} size={18} /><span className="text-secondary font-bold">{item.label}</span></button>)}</div>
    <section aria-labelledby="answers" className="flex flex-col gap-3"><div className="flex items-end justify-between gap-3"><div><h2 id="answers" className="text-card-title font-bold text-ink">إجابات رسمية بشكل أبسط</h2><p className="text-secondary text-muted">نختصر لك، والنص الرسمي دائمًا له رابط مصدره.</p></div><button type="button" onClick={() => { setTopic(null); setQuery(""); }} className="min-h-11 text-secondary text-hh-2736">مسح</button></div>
      {items.length === 0 ? <div className="surface-raise flex flex-col gap-3 rounded-card p-4"><p className="text-body text-ink">ما لقينا جواب مباشر بهذا المعنى.</p><Link href={{ pathname: "/ask", query: { gate: "question", t: query } }} className="inline-flex min-h-11 items-center justify-center rounded-button bg-hh-2736 px-4 font-bold text-panel">اكتب سؤالك لنا</Link></div> : <div className="flex flex-col gap-2">{items.map((item) => <details key={item.id} className="surface-raise group rounded-card p-4"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-bold text-ink"><span>{item.question}</span><Icon name="chevronDown" size={16} className="shrink-0 transition-transform group-open:rotate-180" /></summary><div className="mt-3 border-t border-line pt-3"><p className="text-body text-ink-soft">{item.shortAnswer}</p><a href={item.sourceUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 text-secondary font-bold text-hh-2736"><Icon name="info" size={15} /><span>{item.sourceLabel}</span></a><div className="mt-2"><Link href={{ pathname: "/ask", query: { gate: "question", t: item.question } }} className="text-secondary text-muted underline-offset-4 hover:underline">باقي عندي سؤال عن هذا</Link></div></div></details>)}</div>}
    </section>
    <a href={OFFICIAL_FAQ_URL} target="_blank" rel="noreferrer" className="flex min-h-11 items-center justify-center gap-2 rounded-button border border-line bg-panel px-4 text-secondary font-bold text-hh-2736"><Icon name="knowledge" size={16} />فتح كتيب الصحة القابضة الرسمي</a>
  </div>;
}
