import { Suspense } from "react";
import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AskFlow } from "@/components/app/AskFlow";
import { SkeletonList } from "@/components/ui/States";

export const metadata: Metadata = { title: "شارك — جسر التحول", robots: { index: false } };
export default function AskPage() { return <AppShell ask={false} title="اكتب اللي بخاطرك" subtitle="شاشة واحدة وبس. اكتب، راجع، وأرسل بدون اسمك." back={{ href: "/share", label: "رجوع" }}><Suspense fallback={<SkeletonList count={2} />}><AskFlow /></Suspense></AppShell>; }
