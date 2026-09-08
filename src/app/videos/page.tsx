import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ShortsFeed } from "@/components/app/ShortsFeed";

export const metadata: Metadata = { title: "مختصرات التحول — جسر التحول", robots: { index: false } };
export default function VideosPage() { return <AppShell immersive ask={false} title="مختصرات التحول" subtitle="محتوى قصير من مصادر رسمية. صوت الخلفية يوقف هنا تلقائيًا عشان ما يتداخل مع المقطع."><ShortsFeed /></AppShell>; }
