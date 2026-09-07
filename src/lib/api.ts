"use client";

import { getDeviceHash } from "./device";

/** نداء الواجهة: يضيف تلبيد الجهاز ولا يرسل أي شيء آخر عن المستخدم. */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { headers: { "x-device-hash": await getDeviceHash() }, cache: "no-store" });
  if (!res.ok) throw new ApiError(res.status, await safeJson(res));
  return (await res.json()) as T;
}

export async function apiSend<T>(path: string, body: Record<string, unknown>, method: "POST" | "DELETE" = "POST"): Promise<T> {
  const deviceHash = await getDeviceHash();
  const res = await fetch(path, {
    method,
    headers: { "content-type": "application/json", "x-device-hash": deviceHash },
    body: JSON.stringify({ ...body, deviceHash }),
  });
  if (!res.ok) throw new ApiError(res.status, await safeJson(res));
  return (await res.json()) as T;
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload: unknown,
  ) {
    super(`api_error_${status}`);
    this.name = "ApiError";
  }
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return "تجاوزت عدد المحاولات المسموح. حاول لاحقًا.";
    if (error.status === 409) return "سبق أن سجّلت هذا.";
    if (error.status === 404) return "لا توجد نتيجة.";
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) return "لا يوجد اتصال. حفظنا ما كتبت وسنرسله عند عودة الشبكة.";
  return "تعذّر إتمام الطلب. أعد المحاولة.";
}
