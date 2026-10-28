import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { RumorsPanel } from "@/components/app/RumorsPanel";
import { listPublishedRumors } from "@/server/rumors";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "تأكد من المعلومة — جسر التحول", robots: { index: false } };
export default async function RumorsPage() { const rumors = await listPublishedRumors(); return <AppShell ask={false} title="تأكد من المعلومة" subtitle="سمعت شيء عن التحول؟ ارسله لنا، والموقف الرسمي يظهر بعد اعتماده."><RumorsPanel items={rumors.map(({ id, claim, count, verdict, officialText }) => ({ id, claim, count, verdict, officialText }))} /></AppShell>; }
