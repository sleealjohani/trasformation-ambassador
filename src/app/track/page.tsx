import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { TrackPanel } from "@/components/app/TrackPanel";
import { SkeletonList } from "@/components/ui/States";

export const metadata: Metadata = { title: "متابعتي — جسر التحول", robots: { index: false } };

export default function TrackPage() {
  return (
    <AppShell title="متابعتي" subtitle="كل مشاركة لها حالة ظاهرة. أدخل رمزك لترى أين وصلت.">
      <Suspense fallback={<SkeletonList count={1} />}>
        <TrackPanel />
      </Suspense>
    </AppShell>
  );
}
