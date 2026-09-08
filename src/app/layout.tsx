import type { Metadata, Viewport } from "next";
import { Intro } from "@/components/app/Intro";
import { ServiceWorker } from "@/components/app/ServiceWorker";
import { STRINGS } from "@/content/strings";
import "./globals.css";
import "./intro.css";

export const metadata: Metadata = {
  title: { default: `${STRINGS.appName} — ${STRINGS.appSubtitle}`, template: `%s` },
  description: STRINGS.promise,
  applicationName: STRINGS.appName,
  // لا تحليلات طرف ثالث ولا أي مورد خارجي في واجهة الموظف.
  robots: { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // التكبير حتى ٢٠٠٪ مسموح — لا نقيّد المستخدم
  maximumScale: 5,
  themeColor: "#15508A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* الوزنان المعتمدان يُحمَّلان مبكرًا: أول رسم للمحتوى دون ١٫٨ ثانية على 4G */}
        <link rel="preload" href="/fonts/JannaLT-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/JannaLT-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        <Intro />
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
