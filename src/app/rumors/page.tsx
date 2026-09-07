import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { RumorsPanel } from "@/components/app/RumorsPanel";
import { listPublishedRumors } from "@/server/rumors";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "سمعت أن… — جسر التحول", robots: { index: false } };

export default async function RumorsPage() {
  const rumors = await listPublishedRumors();
  return (
    <AppShell title="سمعت أن…" subtitle="اكتب ما سمعته، وسيصدر الموقف الرسمي هنا بعد اعتماده.">
      <RumorsPanel items={rumors.map(({ id, claim, count, verdict, officialText }) => ({ id, claim, count, verdict, officialText }))} />
    </AppShell>
  );
}
