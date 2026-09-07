import Image from "next/image";
import Link from "next/link";
import { STRINGS } from "@/content/strings";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[430px] flex-col">
      <header className="surface-dark px-4 pt-6 pb-8">
        <Image
          src="/brand/health-holding-lockup.webp"
          alt="شعار شركة الصحة القابضة"
          width={132}
          height={132}
          priority
          className="brand-lockup--light h-auto w-[132px]"
        />
        <h1 className="mt-6 text-screen-title font-bold">{STRINGS.appName}</h1>
        <p className="mt-2 text-body text-on-dark/80">{STRINGS.motto}</p>
      </header>

      <section className="flex flex-1 flex-col gap-4 px-4 pt-6">
        <p className="text-body text-ink">{STRINGS.promise}</p>

        <p className="rounded-card border border-line bg-panel p-4 text-secondary text-muted">
          المرحلة صفر: التهيئة ونظام التصميم فقط. لم تُبنَ أي ميزة بعد.
        </p>

        <Link
          href="/kitchen-sink"
          className="inline-flex items-center justify-center rounded-button bg-hh-2736 px-4 py-3 text-body font-bold text-panel"
        >
          عرض نظام التصميم
        </Link>
      </section>
    </main>
  );
}
