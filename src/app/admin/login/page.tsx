import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/app/AdminLogin";
import { isAdmin } from "@/server/admin-session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "دخول لوحة السفير", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-bg">
      <header className="surface-dark px-4 pt-10 pb-8">
        <h1 className="text-screen-title font-bold">لوحة سفير التغيير</h1>
        <p className="mt-2 text-body text-on-dark">الدخول برمز واحد. لا حساب مستخدم ولا بريد.</p>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4">
        <AdminLogin />
      </main>
    </div>
  );
}
