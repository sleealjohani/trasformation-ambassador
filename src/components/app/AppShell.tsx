import Image from "next/image";
import Link from "next/link";
import { BottomTabs } from "@/components/ui/BottomTabs";
import { Icon } from "@/components/ui/Icon";
import { ScrollMotion } from "@/components/app/ScrollMotion";
import { SoundToggle } from "@/components/app/SiteAudio";
import { STRINGS } from "@/content/strings";
import { cn } from "@/lib/cn";

/**
 * هيكل التطبيق على طبقات الهوية الخمس:
 * ١ المكان (صورة المبنى) · ٢ الإضاءة · ٣ النافذة والمحتوى · ٤ الشريط العائم · ٥ النوافذ.
 * الطبقتان الأولى والثانية زخرفيتان خلف القراءة ولا تتلقّيان أي تفاعل.
 */
export function AppShell({ title, subtitle, back, hero = false, immersive = false, children }: {
  title: string;
  subtitle?: string;
  back?: { href: string; label: string };
  hero?: boolean;
  ask?: boolean;
  immersive?: boolean;
  children: React.ReactNode;
}) {
  if (immersive) {
    return (
      <div className="v2-app-frame v2-app-frame--immersive flex min-h-dvh flex-col">
        <main className="v2-media-main flex flex-1 flex-col">{children}</main>
        <div className="fixed inset-x-0 bottom-0 z-[100] mx-auto max-w-[480px]"><BottomTabs /></div>
      </div>
    );
  }

  return (
    <>
      {/* الطبقة ١ و٢ — المكان والإضاءة، خارج تدفّق المحتوى تمامًا */}
      <div className="scene" aria-hidden="true" />
      <ScrollMotion />

      <div className="v2-app-frame relative z-10 flex min-h-dvh flex-col">
        {/* الطبقة ٣ — النافذة: تبدأ من الأعلى فيقع الرأس داخلها، ولا يُقرأ أي نص
            فوق الصورة مباشرة. هذا ما يفعله المرجع في الحزمة. */}
        <div className="glass-window mx-4 mb-32 mt-5 flex flex-1 flex-col md:mx-6 md:mt-8">
          <header className={cn("scroll-head relative px-4 pb-5 pt-[max(16px,env(safe-area-inset-top))] md:px-8 md:pt-8", hero ? "v2-hero" : "v2-appbar")}>
            <div className="mx-auto flex w-full max-w-[var(--layout-max-content)] min-h-11 items-start justify-between gap-3">
              {back ? (
                <Link href={back.href} className="press inline-flex min-h-11 items-center gap-2 rounded-tag px-2 text-note text-ink-soft">
                  <Icon name="forward" size={16} /><span>{back.label}</span>
                </Link>
              ) : (
                <div className="min-h-11" />
              )}
              <div className="flex items-center gap-2">
                <SoundToggle />
                {/* جزيرة الشعار: أبيض ٩٢٪، والشعار بداخلها بلا ظل ولا تمويه ولا تغيير نسبة */}
                <Link href="/" aria-label="الرئيسية" className="logo-island inline-flex items-center justify-center p-2">
                  <Image
                    src="/brand/hadithah-logo.svg"
                    alt="شعار مستشفى الحديثة العام"
                    width={128}
                    height={122}
                    priority={hero}
                    className="h-auto w-[52px] md:w-[64px]"
                  />
                </Link>
              </div>
            </div>
            <div className="mx-auto w-full max-w-[var(--layout-max-content)]">
              <p className="rise mt-4 text-tag font-bold text-primary-ink" style={{ "--i": 0 } as React.CSSProperties}>
                {STRINGS.appName}
              </p>
              <h1 className="rise mt-1 text-screen-title font-bold text-ink" style={{ "--i": 1 } as React.CSSProperties}>{title}</h1>
              {subtitle ? (
                <p className="rise mt-2 max-w-[42ch] text-body text-muted" style={{ "--i": 2 } as React.CSSProperties}>{subtitle}</p>
              ) : null}
            </div>
          </header>

          <main className="content-swap flex flex-1 flex-col gap-5 px-4 pb-6 md:px-8">
            <div className="reveal-group mx-auto flex w-full max-w-[var(--layout-max-content)] flex-1 flex-col gap-5">
              {children}
            </div>
            <footer className="glass-card mx-auto mt-4 flex w-full max-w-[var(--layout-max-content)] flex-col items-center gap-3 px-4 pb-4 pt-5">
              <p className="text-center text-tag text-muted">{STRINGS.privacyNotice}</p>
              <Link href="/admin/login" className="press inline-flex min-h-11 items-center gap-2 rounded-tag px-3 text-note text-muted hover:text-primary-ink">
                <Icon name="lock" size={14} /><span>دخول سفير التغيير</span>
              </Link>
            </footer>
          </main>
        </div>

        {/* الطبقة ٤ — الشريط العائم */}
        <div className="fixed inset-x-0 bottom-0 z-[100] mx-auto max-w-[480px] md:max-w-none"><BottomTabs /></div>
      </div>
    </>
  );
}
