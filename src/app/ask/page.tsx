import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AskFlow } from "@/components/app/AskFlow";
import { SkeletonList } from "@/components/ui/States";

export const metadata: Metadata = { title: "شارك ما يشغلك — جسر التحول", robots: { index: false } };

export default function AskPage() {
  return (
    <AppShell title="شارك ما يشغلك" back={{ href: "/", label: "الرئيسية" }}>
      <Suspense fallback={<SkeletonList count={2} />}>
        <AskFlow />
      </Suspense>
    </AppShell>
  );
}
