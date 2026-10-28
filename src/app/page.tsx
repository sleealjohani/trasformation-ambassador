import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { Icon, type IconName } from "@/components/ui/Icon";
import { StatusTag } from "@/components/ui/StatusTag";
import { STRINGS } from "@/content/strings";
import { OFFICIAL_TOPICS } from "@/content/official";
import { toArabicDigits } from "@/lib/numerals";
import { listIssues } from "@/server/issues";

export const dynamic = "force-dynamic";

const ACTIONS: ReadonlyArray<{ href: string; icon: IconName; title: string; hint: string }> = [
  { href: "/ask?gate=question", icon: "question", title: "عندي سؤال", hint: "اسأل عن أي شيء مو واضح لك" },
  { href: "/ask?gate=concern", icon: "concern", title: "فيه شيء مقلقني", hint: "قول لنا وش شاغل بالك" },
  { href: "/ask?gate=idea", icon: "idea", title: "عندي اقتراح", hint: "شارك فكرة تسهّل رحلة التحول" },
  { href: "/pulse", icon: "pulse", title: "شارك برأيك", hint: "استطلاع سريع ياخذ أقل من دقيقة" },
];

const TOPIC_ICON: Record<string, IconName> = { salary: "wallet", contract: "copy", service: "clock", benefits: "spark", leave: "journey", qiwa: "track", transformation: "knowledge" };

export default async function HomePage() {
  const issues = await listIssues({ limit: 3 });
  return (
    <AppShell title="وش بخاطرك عن التحول؟" subtitle={STRINGS.promise} hero ask={false}>
      <section aria-labelledby="start" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3"><h2 id="start" className="text-card-title font-bold text-ink">ابدأ من هنا</h2><span className="rounded-tag bg-tint px-3 py-1 text-tag font-bold text-hh-2736">بدون اسمك</span></div>
        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map((item, i) => (
            <Link key={item.href} href={item.href} className="v2-action-card lift draw flex min-h-[142px] flex-col gap-3 rounded-card p-4" style={{ "--i": i } as React.CSSProperties}>
              <span className="inline-flex size-9 items-center justify-center rounded-icon bg-tint text-hh-2736"><Icon name={item.icon} size={18} /></span>
              <span className="text-card-title font-bold text-ink">{item.title}</span>
              <span className="text-secondary text-muted">{item.hint}</span>
            </Link>
          ))}
        </div>
        <Link href="/rumors" className="surface-raise lift flex min-h-11 items-center gap-3 rounded-card p-4"><span className="inline-flex size-9 shrink-0 items-center justify-center rounded-icon bg-tint text-hh-2736"><Icon name="rumor" size={18} /></span><span className="flex-1"><b className="block text-body text-ink">سمعت معلومة وتبي تتأكد؟</b><span className="text-secondary text-muted">أرسلها لنا ونوضح لك الموقف الرسمي</span></span><Icon name="forward" size={17} /></Link>
      </section>

      <section aria-labelledby="official" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3"><div><h2 id="official" className="text-card-title font-bold text-ink">يمكن جوابك موجود</h2><p className="text-secondary text-muted">معلومات مختصرة من مصادر الصحة القابضة الرسمية</p></div><Link href="/info" className="inline-flex min-h-11 items-center gap-1 text-secondary font-bold text-hh-2736">الكل <Icon name="forward" size={14} /></Link></div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {OFFICIAL_TOPICS.slice(0, 5).map((topic) => <Link key={topic.slug} href={{ pathname: "/info", query: { topic: topic.slug } }} className="surface-raise flex min-w-[128px] flex-col gap-2 rounded-card p-3"><Icon name={TOPIC_ICON[topic.slug] ?? "info"} size={18} /><span className="text-secondary font-bold text-ink">{topic.label}</span></Link>)}
        </div>
      </section>

      <Link href="/videos" className="surface-dark lift relative flex min-h-[132px] flex-col justify-end overflow-hidden rounded-card p-4">
        <span className="mb-5 inline-flex size-10 items-center justify-center rounded-tag bg-panel/10 text-panel"><Icon name="video" size={21} /></span>
        <span className="text-card-title font-bold text-panel">مختصرات التحول</span><span className="mt-1 text-secondary text-on-dark">محتوى قصير من مصادر رسمية — اسحب وشوف اللي يهمك</span>
      </Link>

      <section aria-labelledby="live" className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3"><div><h2 id="live" className="text-card-title font-bold text-ink">أكثر الأشياء اللي تشغل الموظفين</h2><p className="text-secondary text-muted">المواضيع اللي عليها اهتمام الآن</p></div><Link href="/issues" className="inline-flex min-h-11 items-center gap-1 text-secondary font-bold text-hh-2736">شوف الكل <Icon name="forward" size={14} /></Link></div>
        {issues.length === 0 ? <p className="surface-raise rounded-card p-4 text-secondary text-muted">{STRINGS.emptyIssues}</p> : <ul className="flex flex-col gap-2">{issues.map((issue) => <li key={issue.id}><Link href="/issues" className="surface-raise lift flex items-center justify-between gap-3 rounded-card p-4"><span className="min-w-0 flex-1"><b className="block text-body text-ink">{issue.title}</b><span className="text-secondary text-muted">{issue.topicLabel}{issue.weight > 0 ? ` · ${toArabicDigits(issue.weight)} مهتم` : ""}</span></span><StatusTag status={issue.status === "answered" ? "answered" : issue.status === "referred" ? "referred" : issue.status === "waiting" ? "waiting" : "new"} /></Link></li>)}</ul>}
      </section>

      <Link href="/answers" className="surface-raise lift flex items-center gap-3 rounded-card p-4"><span className="inline-flex size-9 shrink-0 items-center justify-center rounded-icon bg-status-answered-tint text-status-answered"><Icon name="check" size={18} /></span><span className="flex-1"><b className="block text-body text-ink">آخر الإجابات</b><span className="text-secondary text-muted">شوف وش اتجاوب عليه من أسئلة الموظفين</span></span><Icon name="forward" size={17} /></Link>
    </AppShell>
  );
}
