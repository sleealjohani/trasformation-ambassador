import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { AppShell } from "@/components/app/AppShell";
import { IssuesList } from "@/components/app/IssuesList";
import { Icon } from "@/components/ui/Icon";
import { listIssues } from "@/server/issues";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "القضايا الحيّة — جسر التحول", robots: { index: false } };

export default async function IssuesPage() {
  // التصويت يعتمد على تلبيد الجهاز؛ الترويسة تصل من طلب العميل عند التنقّل
  const device = (await headers()).get("x-device-hash");
  const issues = await listIssues({ deviceHash: device ?? undefined, limit: 6 });

  return (
    <AppShell title="القضايا الحيّة" subtitle="أعلى ست قضايا بالوزن الأسبوعي — صوّت لما يشغلك.">
      <IssuesList
        initial={issues.map(({ id, title, topicLabel, weight, status, answer, answerSource, voted }) => ({
          id,
          title,
          topicLabel,
          weight,
          status,
          answer,
          answerSource,
          voted,
        }))}
      />
      <Link href="/answers" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-button border border-line bg-panel px-4 text-secondary text-hh-2736 hover:bg-panel-2">
        <Icon name="check" size={16} />
        <span>كل الأسئلة والإجابات</span>
      </Link>
    </AppShell>
  );
}
