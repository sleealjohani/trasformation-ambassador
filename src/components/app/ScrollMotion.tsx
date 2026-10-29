"use client";

import { useEffect } from "react";

/**
 * حركة الظهور عند التمرير مبنية على CSS scroll-driven animations، فلا تحتاج
 * هذا المكوّن أصلًا في المتصفحات التي تدعمها. وظيفته واحدة: أن يمنح المتصفحات
 * التي لا تدعمها الحركة نفسها عبر IntersectionObserver.
 *
 * الحالة المخفية لا تُكتب في CSS إلا تحت `[data-motion="js"]`، وهذا المكوّن
 * وحده من يضع تلك السمة. فإن تعطّل جافاسكربت بقي كل محتوى ظاهرًا.
 */
export function ScrollMotion() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (CSS.supports("animation-timeline: view()")) return;

    const root = document.documentElement;
    root.dataset.motion = "js";

    const targets = document.querySelectorAll<HTMLElement>("[data-reveal], .reveal-group > *");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    for (const el of targets) observer.observe(el);

    return () => {
      observer.disconnect();
      delete root.dataset.motion;
    };
  }, []);

  return null;
}
