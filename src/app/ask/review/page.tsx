import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ReviewForm } from "@/components/app/ReviewForm";

export const metadata: Metadata = { title: "المراجعة قبل الإرسال — جسر التحول", robots: { index: false } };

export default function ReviewPage() {
  return (
    <AppShell ask={false} title="راجع قبل الإرسال" back={{ href: "/ask", label: "رجوع" }}>
      <ReviewForm />
    </AppShell>
  );
}
