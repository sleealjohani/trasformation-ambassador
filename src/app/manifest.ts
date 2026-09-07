import type { MetadataRoute } from "next";
import { STRINGS } from "@/content/strings";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${STRINGS.appName} — ${STRINGS.appSubtitle}`,
    short_name: STRINGS.appName,
    description: STRINGS.promise,
    lang: "ar",
    dir: "rtl",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#F2F6FA",
    theme_color: "#15508A",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
