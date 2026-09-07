import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { OfflineBanner } from "@/components/ui/States";
import { STRINGS } from "@/content/strings";

export const metadata: Metadata = { title: "دون اتصال — جسر التحول", robots: { index: false } };

export default function OfflinePage() {
  return (
    <AppShell title="دون اتصال">
      <OfflineBanner />
      <p className="text-body text-ink">{STRINGS.offline}</p>
      <p className="text-secondary text-muted">
        ما سبق أن فتحته من القضايا وجسر المعرفة والإجابات يبقى متاحًا للقراءة. الإرسال يستأنف تلقائيًا عند عودة الشبكة.
      </p>
    </AppShell>
  );
}
