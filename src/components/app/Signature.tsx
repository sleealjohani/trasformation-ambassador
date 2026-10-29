"use client";

import { useEffect } from "react";

/**
 * توقيع صانعة الموقع لمن يفتح أدوات المطوّر.
 *
 * لا يُرى في الواجهة، ولا يُرسل شيئًا، ولا يخزّن شيئًا، ولا يقيس شيئًا —
 * سطران في الكونسول فحسب، فلا يمسّ مبدأ «لا تحليلات في واجهة الموظف».
 *
 * النسبة الكاملة في /humans.txt، وتظهر كذلك في بيانات الصفحة الوصفية
 * وعلى أي نسخة مطبوعة.
 */
export function Signature() {
  useEffect(() => {
    try {
      console.log(
        "%c جسر التحول %c saaalrowily ",
        "background:#103F4B;color:#FFFFFF;padding:6px 10px;border-radius:8px 0 0 8px;font-weight:700",
        "background:#057590;color:#FFFFFF;padding:6px 10px;border-radius:0 8px 8px 0",
      );
      console.log("%c© saaalrowily · /humans.txt", "color:#3D5155");
    } catch {
      /* الكونسول غير متاح — لا أثر */
    }
  }, []);

  return null;
}
