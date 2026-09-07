import { createHash } from "node:crypto";
import { env } from "./env";

/** تلبيد ثانٍ على الخادم: لا يصل تلبيد المتصفح إلى التخزين كما هو. */
export function hashDevice(clientHash: string): string {
  return createHash("sha256").update(`${clientHash}:${env.refCodePepper}`).digest("hex");
}

export function hashRef(code: string): string {
  return createHash("sha256").update(code + env.refCodePepper).digest("hex");
}
