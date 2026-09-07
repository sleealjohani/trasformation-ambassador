import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { PulsePanel } from "@/components/app/PulsePanel";
import { currentWeek, listPulseWeeks } from "@/server/pulse";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "نبض التحول — جسر التحول", robots: { index: false } };

export default async function PulsePage() {
  const [weeks, week] = await Promise.all([listPulseWeeks(), currentWeek()]);
  return (
    <AppShell title="نبض التحول" subtitle="سؤال واحد كل أسبوع. النتيجة التي تراها هي نفسها التي تراها الإدارة.">
      <PulsePanel weeks={weeks} currentWeek={week} />
    </AppShell>
  );
}
