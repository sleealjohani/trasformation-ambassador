"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Chip } from "@/components/ui/Chip";
import { Icon } from "@/components/ui/Icon";
import { StatusTag } from "@/components/ui/StatusTag";
import { EmptyState } from "@/components/ui/States";
import { Button } from "@/components/ui/Button";
import { STRINGS } from "@/content/strings";
import { toArabicDigits } from "@/lib/numerals";
import type { VisibleStatus } from "@/lib/state";

export type FaqItem = { id: string; question: string; answer: string | null; source: string | null; topic: string; topicLabel: string; updatedAt: string; interestCount: number; status: string };
function toStatus(status: string): VisibleStatus { if (status === "published" || status === "answered") return "answered"; if (status === "referred") return "referred"; if (status === "waiting") return "waiting"; return "new"; }
function formatDate(iso: string): string { return toArabicDigits(new Intl.DateTimeFormat("ar-SA-u-nu-latn", { day: "numeric", month: "long" }).format(new Date(iso))); }

export function AnswersList({ items, topics }: { items: FaqItem[]; topics: Array<{ slug: string; label: string }> }) {
  const [topic, setTopic] = useState<string | null>(null); const [query, setQuery] = useState("");
  const filtered = useMemo(() => { const q = query.trim(); return items.filter((i) => (topic === null || i.topic === topic) && (q === "" || i.question.includes(q) || (i.answer ?? "").includes(q))); }, [items, topic, query]);
  return <div className="flex flex-col gap-4"><div className="flex flex-col gap-2"><label htmlFor="q" className="text-secondary text-muted">ابحث في الإجابات</label><input id="q" value={query} onChange={(e) => setQuery(e.target.value)} className="min-h-11 w-full rounded-button border border-line bg-panel px-4 text-body text-ink outline-none focus-visible:border-hh-2736" placeholder="اكتب كلمة من سؤالك…" /></div><div className="flex flex-wrap gap-2" role="group" aria-label="فلترة بالموضوع"><Chip selected={topic === null} onClick={() => setTopic(null)}>الكل</Chip>{topics.map((t) => <Chip key={t.slug} selected={topic === t.slug} onClick={() => setTopic(topic === t.slug ? null : t.slug)}>{t.label}</Chip>)}</div>{filtered.length === 0 ? <div className="flex flex-col gap-3"><EmptyState icon="question" text="ما لقينا سؤال بهذا المعنى للحين." /><Link href={{ pathname: "/ask", query: { gate: "question", t: query } }} className="contents"><Button full><Icon name="send" size={16} /><span>اسألنا عنه</span></Button></Link></div> : <ul className="flex flex-col gap-3">{filtered.map((item, i) => <li key={item.id} className="rise lift surface-raise flex flex-col gap-3 rounded-card p-4" style={{ "--i": Math.min(i, 6) } as React.CSSProperties}><div className="flex items-start justify-between gap-3"><h2 className="text-card-title font-bold text-ink">{item.question}</h2><StatusTag status={toStatus(item.status)} /></div><p className="text-secondary text-muted">{item.topicLabel}</p>{item.answer ? <div className="rounded-button border border-line bg-panel-2 p-3"><p className="text-body text-ink">{item.answer}</p>{item.source ? <p className="mt-2 text-secondary text-muted">المصدر: {item.source}</p> : null}</div> : <p className="text-secondary text-muted">{STRINGS.noOfficialInfo}</p>}<p className="flex flex-wrap gap-x-3 border-t border-line pt-2 text-secondary text-muted"><span>{toArabicDigits(item.interestCount)} مهتم</span><span>آخر تحديث {formatDate(item.updatedAt)}</span></p></li>)}</ul>}</div>;
}
