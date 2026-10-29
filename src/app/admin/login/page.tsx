import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { AdminLogin } from "@/components/app/AdminLogin";
import { Icon } from "@/components/ui/Icon";
import { isAdmin } from "@/server/admin-session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "دخول لوحة سفير التغيير", robots: { index: false } };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");

  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-bg">
      <header className="surface-dark px-4 pt-10 pb-9">
        {/* النسخة البيضاء على #103F4B أو أغمق — قاعدة الدليل. لا فلتر على الشعار. */}
        <Image
          src="/brand/hadithah-logo-white.svg"
          alt="شعار مستشفى الحديثة العام"
          width={128}
          height={122}
          priority
          className="fade-in h-auto w-[96px]"
        />
        <h1 className="rise mt-6 flex items-center gap-2 text-screen-title font-bold" style={{ "--i": 1 } as React.CSSProperties}>
          <Icon name="lock" size={20} />
          <span>لوحة سفير التغيير</span>
        </h1>
        <p className="rise mt-2 text-body text-inverse-muted" style={{ "--i": 2 } as React.CSSProperties}>
          الدخول برمز واحد. لا حساب مستخدم ولا بريد ولا كلمة مرور شخصية.
        </p>
      </header>

      <main className="screen-in flex flex-1 flex-col gap-4 p-4">
        <AdminLogin />

        <section className="surface-raise flex flex-col gap-2 rounded-card p-4">
          <h2 className="text-note font-bold text-ink">ما الذي تديره من هنا؟</h2>
          <ul className="flex flex-col gap-2">
            {[
              "الوارد مرتّبًا بالإلحاح، ومعه صندوق «يحتاج قراءة»",
              "التصنيف والدمج في القضايا والإحالة لفريق التحول",
              "نشر الإجابات المعتمدة بمصدر إلزامي، ومواقف الشائعات",
              "تقرير الأسبوع مجمّعًا بلا نص خام",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2 text-note text-ink-soft">
                <span className="mt-1 text-primary">
                  <Icon name="check" size={14} />
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </section>

        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-button border border-line bg-panel px-4 text-note text-ink-soft transition-colors duration-[120ms] hover:bg-section"
        >
          <Icon name="forward" size={16} />
          <span>رجوع لواجهة الموظف</span>
        </Link>
      </main>
    </div>
  );
}
