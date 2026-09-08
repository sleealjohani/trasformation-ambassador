import Image from "next/image";
import Link from "next/link";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Icon } from "@/components/ui/Icon";
import { SoundToggle } from "@/components/app/SiteAudio";
import { STRINGS } from "@/content/strings";
import { cn } from "@/lib/cn";

export function AppShell({ title, subtitle, back, hero = false, immersive = false, children }: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  hero?: boolean;
  ask?: boolean;
  immersive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="v2-app-frame flex min-h-dvh flex-col">
      <header className={cn("relative px-4 pb-5 pt-[max(16px,env(safe-area-inset-top))]", hero ? "surface-dark v2-hero" : "v2-appbar")}>
        <div className="flex min-h-11 items-center justify-between gap-3">
          {back ? (
            <Link href={back.href} className={cn("inline-flex min-h-11 items-center gap-2 rounded-tag px-2 text-secondary", hero ? "text-on-dark" : "text-ink-soft")}>
              <Icon name="forward" size={16} /><span>{back.label}</span>
            </Link>
          ) : (
            <Link href="/" aria-label="الرئيسية" className="inline-flex min-h-11 items-center">
              <Image src="/brand/health-holding-lockup.webp" alt="شعار شركة الصحة القابضة" width={132} height={132} priority={hero} className={cn("h-auto w-[104px]", hero && "brand-lockup--light")} />
            </Link>
          )}
          <SoundToggle />
        </div>
        <h1 className={cn("rise mt-3 font-bold", hero ? "text-[26px] leading-[1.45] text-panel" : "text-screen-title text-ink")} style={{ "--i": 1 } as React.CSSProperties}>{title}</h1>
        {subtitle ? <p className={cn("rise mt-1.5 text-body", hero ? "max-w-[360px] text-on-dark" : "text-muted")} style={{ "--i": 2 } as React.CSSProperties}>{subtitle}</p> : null}
      </header>
      <main className={cn("screen-in flex flex-1 flex-col", immersive ? "v2-media-main" : "gap-5 px-4 pb-32 pt-5")}>{children}
        {!immersive ? <footer className="mt-3 flex flex-col items-center gap-3 border-t border-line pb-2 pt-5"><p className="text-center text-tag text-faint">{STRINGS.privacyNotice}</p><Link href="/admin/login" className="inline-flex min-h-11 items-center gap-2 rounded-tag px-3 text-secondary text-muted hover:text-hh-2736"><Icon name="lock" size={14} /><span>دخول سفير التغيير</span></Link></footer> : null}
      </main>
      <div className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-[480px]"><BottomTabs /></div>
    </div>
  );
}
