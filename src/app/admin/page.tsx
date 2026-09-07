import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/app/AdminDashboard";
import { LogoutButton } from "@/components/app/LogoutButton";
import { isAdmin } from "@/server/admin-session";
import { listTopics } from "@/server/topics";
import { listInbox } from "@/server/submissions";
import { listIssues } from "@/server/issues";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "لوحة سفير التغيير", robots: { index: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");
  const [topics, inbox, issues] = await Promise.all([listTopics(), listInbox({}), listIssues({ limit: 100, includeReview: true })]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-bg">
      <header className="surface-dark flex items-start justify-between gap-3 px-4 pt-6 pb-6">
        <div>
          <h1 className="text-screen-title font-bold">لوحة سفير التغيير</h1>
          <p className="mt-2 text-secondary text-on-dark">كل إجراء هنا يُسجَّل في سجل التدقيق.</p>
        </div>
        <LogoutButton />
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4">
        <AdminDashboard topics={topics} initialInbox={inbox} initialIssues={issues} />
      </main>
    </div>
  );
}
