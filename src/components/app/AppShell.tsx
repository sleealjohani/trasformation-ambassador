import Image from "next/image";
import Link from "next/link";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Icon } from "@/components/ui/Icon";
import { STRINGS } from "@/content/strings";

/**
 * الإطار العام: ترويسة داكنة بالنقش والشعار، ثم المحتوى بدخول متدرّج،
 * ثم زر «شارك ما يشغلك» العائم، والشريط السفلي الثابت، ومدخل السفير في الذيل.
 */
export function AppShell({
  title,
  subtitle,
  back,
  hero = false,
  ask = true,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  hero?: boolean;
  /** يخفي الزر العائم في الشاشات التي هي نفسها مسار الإرسال */
  ask?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-bg">
      <header className="surface-dark px-4 pt-6 pb-7">
        {back ? (
          <Link
            href={back.href}
            className="mb-4 inline-flex min-h-11 items-center gap-2 rounded-tag px-3 text-secondary text-on-dark transition-colors duration-[120ms] hover:bg-white/10"
          >
            <Icon name="forward" size={16} />
            <span>{back.label}</span>
          </Link>
        ) : (
          <div className="fade-in flex items-center gap-3">
            <Image
              src="/brand/health-holding-lockup.webp"
              alt="شعار شركة الصحة القابضة"
              width={132}
              height={132}
              priority
              className="brand-lockup--light h-auto w-[112px]"
            />
          </div>
        )}
        <h1 className="rise mt-4 text-screen-title font-bold" style={{ "--i": 1 } as React.CSSProperties}>
          {title}
        </h1>
        {subtitle ? (
          <p className="rise mt-2 text-body text-on-dark" style={{ "--i": 2 } as React.CSSProperties}>
            {subtitle}
          </p>
        ) : null}
        {hero ? (
          <p className="rise mt-3 text-secondary text-on-dark" style={{ "--i": 3 } as React.CSSProperties}>
            {STRINGS.motto}
          </p>
        ) : null}
      </header>

      <main className="screen-in flex flex-1 flex-col gap-4 px-4 pt-6 pb-28">
        {children}

        <footer className="mt-6 flex flex-col items-center gap-3 border-t border-line pt-6 pb-2">
          <p className="text-tag text-faint">{STRINGS.privacyNotice}</p>
          <Link
            href="/admin/login"
            className="inline-flex min-h-11 items-center gap-2 rounded-tag border border-line bg-panel px-4 text-secondary text-ink-soft transition-colors duration-[120ms] hover:bg-panel-2 hover:text-hh-2736"
          >
            <Icon name="lock" size={14} />
            <span>دخول سفير التغيير</span>
          </Link>
        </footer>
      </main>

      {ask ? (
        <Link href={{ pathname: "/ask", query: { gate: "question" } }} className="fab beckon" aria-label="شارك ما يشغلك">
          <Icon name="plus" size={18} />
          <span className="text-body">شارك ما يشغلك</span>
        </Link>
      ) : null}

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px]">
        <BottomTabs />
      </div>
    </div>
  );
}
