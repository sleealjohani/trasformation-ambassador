import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { OfficialFaqGuide } from "@/components/app/OfficialFaqGuide";

export const metadata: Metadata = { title: "معلومات تهمك — جسر التحول", robots: { index: false } };
export default function InfoPage() { return <AppShell title="معلومات تهمك" subtitle="قبل ما تحتار أو تسأل، جرّب تلقى جوابك من المصدر الرسمي."><Suspense fallback={<div className="h-40 rounded-card bg-panel" />}><OfficialFaqGuide /></Suspense></AppShell>; }
