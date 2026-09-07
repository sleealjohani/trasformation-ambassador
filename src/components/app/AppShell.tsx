import Image from "next/image";
import Link from "next/link";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Icon } from "@/components/ui/Icon";
import { STRINGS } from "@/content/strings";

/** الترويسة الداكنة بالشعار الأبيض والنقش، ثم المحتوى، ثم الشريط السفلي الثابت. */
export function AppShell({
  title,
  subtitle,
  back,
  hero = false,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  hero?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-[430px] flex-col bg-bg">
      <header className="surface-dark px-4 pt-6 pb-6">
        {back ? (
          <Link href={back.href} className="mb-4 inline-flex min-h-11 items-center gap-2 text-secondary text-on-dark hover:underline">
            <Icon name="forward" size={16} />
            <span>{back.label}</span>
          </Link>
        ) : (
          <Image
            src="/brand/health-holding-lockup.webp"
            alt="شعار شركة الصحة القابضة"
            width={132}
            height={132}
            priority
            className="brand-lockup--light h-auto w-[132px]"
          />
        )}
        <h1 className="mt-4 text-screen-title font-bold">{title}</h1>
        {subtitle ? <p className="mt-2 text-body text-on-dark">{subtitle}</p> : null}
        {hero ? <p className="mt-3 text-secondary text-on-dark">{STRINGS.motto}</p> : null}
      </header>

      <main className="flex flex-1 flex-col gap-4 px-4 pt-6 pb-28">{children}</main>

      <div className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-[430px]">
        <BottomTabs />
      </div>
    </div>
  );
}
