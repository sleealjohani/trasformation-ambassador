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

  return <div className="admin-control-page min-h-dvh bg-bg">
    <style>{`@media (max-width: 767px) {
      .admin-control-page main > div > div:first-child {
        position: relative !important;
        top: auto !important;
        z-index: 1 !important;
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }

      .admin-control-page [role="tablist"] {
        display: grid !important;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 4px !important;
        overflow: visible !important;
        align-items: stretch !important;
      }

      .admin-control-page [role="tablist"] > [role="tab"] {
        width: 100%;
        min-width: 0 !important;
        padding-inline: 4px !important;
        flex-direction: column;
        justify-content: center;
        gap: 2px !important;
        text-align: center;
        font-size: 11px;
        line-height: 1.25;
      }

      .admin-control-page [role="tablist"] > button:not([role="tab"]) {
        grid-column: 1 / -1;
        width: 100%;
        margin-inline-start: 0 !important;
        justify-content: center;
      }
    }`}</style>
    <header className="surface-dark relative z-0 px-4 py-5 md:px-6"><div className="mx-auto flex max-w-[1280px] items-start justify-between gap-4"><div><p className="text-tag font-bold text-on-dark">جسر التحول · الإدارة</p><h1 className="mt-1 text-[28px] font-bold leading-tight text-panel md:text-[34px]">مركز تحكم سفير التغيير</h1><p className="mt-2 max-w-2xl text-secondary text-on-dark">راقب اللي يشغل الموظفين، عدّل المحتوى، أدر المختصرات، وأصدر تقارير من مكان واحد.</p></div><LogoutButton /></div></header>
    <main className="relative z-10 mx-auto max-w-[1280px] p-4 pb-12 md:p-6"><AmbassadorControlCenter topics={topics} initialInbox={inbox} initialIssues={issues} initialSnapshot={snapshot} /></main>
  </div>;
}
