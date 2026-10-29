import type { Metadata, Viewport } from "next";
import { Intro } from "@/components/app/Intro";
import { ServiceWorker } from "@/components/app/ServiceWorker";
import { Signature } from "@/components/app/Signature";
import { SiteAudioProvider } from "@/components/app/SiteAudio";
import { STRINGS } from "@/content/strings";
import "./globals.css";
import "./intro.css";
import "./v2.css";

export const metadata: Metadata = {
  title: { default: `${STRINGS.appName} — ${STRINGS.appSubtitle}`, template: `%s` },
  description: STRINGS.promise,
  applicationName: STRINGS.appName,
  authors: [{ name: "saaalrowily", url: "/humans.txt" }],
  creator: "saaalrowily",
  publisher: "saaalrowily",
  robots: { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, themeColor: "#103F4B" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(sessionStorage.getItem('bridge:intro-seen')==='1')document.documentElement.dataset.introSeen='1'}catch(e){}` }} />
        <link rel="preload" href="/fonts/JannaLT-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/JannaLT-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body>
        {/* © saaalrowily — جسر التحول · التفاصيل في /humans.txt */}
        <SiteAudioProvider>
          <Intro />
          {children}
          <ServiceWorker />
          <Signature />
        </SiteAudioProvider>
      </body>
    </html>
  );
}
