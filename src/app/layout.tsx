import type { Metadata, Viewport } from "next";
import { ServiceWorker } from "@/components/app/ServiceWorker";
import { STRINGS } from "@/content/strings";
import "./globals.css";

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
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
