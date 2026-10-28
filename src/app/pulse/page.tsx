import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { PulsePanel } from "@/components/app/PulsePanel";
import { currentWeek, listPulseWeeks } from "@/server/pulse";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "استطلاع الأسبوع — جسر التحول", robots: { index: false } };
export default async function PulsePage() { const [weeks, week] = await Promise.all([listPulseWeeks(), currentWeek()]); return <AppShell ask={false} title="استطلاع الأسبوع" subtitle="سؤال سريع ياخذ أقل من دقيقة. ردك مجهول والنتيجة مجمّعة."><PulsePanel weeks={weeks} currentWeek={week} /></AppShell>; }
