import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { Icon, type IconName } from "@/components/ui/Icon";

export const metadata: Metadata = { title: "شارك — جسر التحول", robots: { index: false } };

const OPTIONS: ReadonlyArray<{ href: string; icon: IconName; title: string; hint: string }> = [
  { href: "/ask?gate=question", icon: "question", title: "عندي سؤال", hint: "إذا فيه شيء مو واضح لك عن التحول" },
  { href: "/ask?gate=concern", icon: "concern", title: "فيه شيء مقلقني", hint: "مخاوف، ملاحظة أو شيء شاغل بالك" },
  { href: "/ask?gate=idea", icon: "idea", title: "عندي اقتراح", hint: "فكرة تشوف إنها بتسهّل التجربة" },
  { href: "/rumors", icon: "rumor", title: "أبي أتأكد من معلومة", hint: "سمعت شيء وتبي تعرف الموقف الرسمي" },
];

export default function SharePage() {
  return <AppShell ask={false} title="شاركنا وش بخاطرك" subtitle="اختر الأقرب لك، وبعدها اكتب بطريقتك. ما نطلب اسمك.">
    <div className="grid grid-cols-2 gap-3">{OPTIONS.map((item, i) => <Link key={item.href} href={item.href} className="v2-action-card lift draw flex min-h-[150px] flex-col gap-3 rounded-card p-4" style={{ "--i": i } as React.CSSProperties}><span className="inline-flex size-9 items-center justify-center rounded-icon bg-tint text-hh-2736"><Icon name={item.icon} size={18} /></span><b className="text-card-title text-ink">{item.title}</b><span className="text-secondary text-muted">{item.hint}</span></Link>)}</div>
    <Link href="/info" className="surface-raise lift flex items-center gap-3 rounded-card p-4"><Icon name="info" size={20} /><span className="flex-1"><b className="block text-body text-ink">قبل ما تسأل… يمكن جوابك موجود</b><span className="text-secondary text-muted">ابحث في المعلومات الرسمية أول</span></span><Icon name="forward" size={16} /></Link>
    <Link href="/pulse" className="surface-raise lift flex items-center gap-3 rounded-card p-4"><Icon name="pulse" size={20} /><span className="flex-1"><b className="block text-body text-ink">استطلاع الأسبوع</b><span className="text-secondary text-muted">سؤال سريع ياخذ أقل من دقيقة</span></span><Icon name="forward" size={16} /></Link>
  </AppShell>;
}
