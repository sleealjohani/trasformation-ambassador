"use client";

import { useSyncExternalStore } from "react";

const noopSubscribe = () => () => undefined;

/** true بعد التركيب فقط — يسمح بقراءة التخزين المحلي بلا اختلاف في الترطيب. */
export function useMounted(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

function subscribeOnline(onChange: () => void) {
  window.addEventListener("online", onChange);
  window.addEventListener("offline", onChange);
  return () => {
    window.removeEventListener("online", onChange);
    window.removeEventListener("offline", onChange);
  };
}

/** حالة الاتصال — تُفترض متصلة على الخادم. */
export function useOnline(): boolean {
  return useSyncExternalStore(subscribeOnline, () => navigator.onLine, () => true);
}
