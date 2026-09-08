import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AmbassadorControlCenter } from "@/components/app/AmbassadorControlCenter";
import { LogoutButton } from "@/components/app/LogoutButton";
import { isAdmin } from "@/server/admin-session";
import { controlCenterSnapshot } from "@/server/control-center";
import { listTopics } from "@/server/topics";
import { listInbox } from "@/server/submissions";
import { listIssues } from "@/server/issues";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "مركز تحكم سفير التغيير", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [topics, inbox, issues, snapshot] = await Promise.all([
    listTopics(),
    listInbox({}),
    listIssues({ limit: 100, includeReview: true }),
    controlCenterSnapshot(),
  ]);

  return <div className="min-h-dvh bg-bg">
    <header className="surface-dark relative z-0 px-4 py-5 md:px-6"><div className="mx-auto flex max-w-[1280px] items-start justify-between gap-4"><div><p className="text-tag font-bold text-on-dark">جسر التحول · الإدارة</p><h1 className="mt-1 text-[28px] font-bold leading-tight text-panel md:text-[34px]">مركز تحكم سفير التغيير</h1><p className="mt-2 max-w-2xl text-secondary text-on-dark">راقب اللي يشغل الموظفين، عدّل المحتوى، أدر المختصرات، وأصدر تقارير من مكان واحد.</p></div><LogoutButton /></div></header>
    <main className="relative z-10 mx-auto max-w-[1280px] p-4 pb-12 [&>div>div:first-child]:static md:p-6 md:[&>div>div:first-child]:sticky"><AmbassadorControlCenter topics={topics} initialInbox={inbox} initialIssues={issues} initialSnapshot={snapshot} /></main>
  </div>;
}
