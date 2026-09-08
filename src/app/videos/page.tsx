import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ShortsFeed } from "@/components/app/ShortsFeed";
import { OFFICIAL_SHORTS } from "@/content/official";
import { listPublishedMedia } from "@/server/control-center";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مختصرات التحول — جسر التحول", robots: { index: false } };

export default async function VideosPage() {
  let items = OFFICIAL_SHORTS.filter((item) => item.localSrc).map((item) => ({ id: item.id, title: item.title, mediaUrl: item.localSrc as string }));
  try {
    const managed = await listPublishedMedia();
    if (managed.length > 0) items = managed.map((item) => ({ id: item.id, title: item.title, mediaUrl: item.mediaUrl }));
  } catch {
    // يبقى المحتوى المحلي الحالي متاحًا حتى لو تعذرت قاعدة البيانات.
  }
  return <AppShell immersive ask={false} title="مختصرات التحول"><ShortsFeed items={items} /></AppShell>;
}
