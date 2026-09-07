import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { DoneCard } from "@/components/app/DoneCard";

export const metadata: Metadata = { title: "أُرسلت — جسر التحول", robots: { index: false } };

export default function DonePage() {
  return (
    <AppShell title="أُرسلت مشاركتك" back={{ href: "/", label: "الرئيسية" }}>
      <DoneCard />
    </AppShell>
  );
}
