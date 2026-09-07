"use client";

import { useEffect } from "react";
import { OUTBOX_KEY, readLocal, writeLocal } from "@/lib/storage";
import { getDeviceHash } from "@/lib/device";

/** تسجيل خدمة العمل + إرسال ما تأجّل عند عودة الشبكة. */
export function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    async function flush() {
      const queue = readLocal<Array<Record<string, unknown>>>(OUTBOX_KEY) ?? [];
      if (queue.length === 0) return;
      const deviceHash = await getDeviceHash();
      const remaining: Array<Record<string, unknown>> = [];
      for (const item of queue) {
        try {
          const res = await fetch("/api/submissions", {
            method: "POST",
            headers: { "content-type": "application/json", "x-device-hash": deviceHash },
            body: JSON.stringify({ ...item, deviceHash }),
          });
          if (!res.ok && res.status >= 500) remaining.push(item);
        } catch {
          remaining.push(item);
        }
      }
      writeLocal(OUTBOX_KEY, remaining);
    }

    void flush();
    window.addEventListener("online", () => void flush());
    return () => window.removeEventListener("online", () => void flush());
  }, []);

  return null;
}
