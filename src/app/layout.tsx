import type { Metadata, Viewport } from "next";
import { STRINGS } from "@/content/strings";
import "./globals.css";

export const metadata: Metadata = {
  title: `${STRINGS.appName} — ${STRINGS.appSubtitle}`,
  description: STRINGS.promise,
  // لا تحليلات طرف ثالث ولا أي مورد خارجي في واجهة الموظف.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15508A",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
