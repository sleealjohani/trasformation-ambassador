import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { isAdmin } from "./admin-session";
import { audit } from "./audit";
import { RateLimited } from "./submissions";

export const DEVICE_HEADER = "x-device-hash";
export const deviceHashSchema = z.string().regex(/^[0-9a-f]{64}$/);

export function json<T>(data: T, init?: number | ResponseInit) {
  return NextResponse.json(data, typeof init === "number" ? { status: init } : init);
}

/** رفض صامت: لا نكشف قاعدة الحجب */
export function rateLimited() {
  return json({ error: "rate_limited" }, 429);
}

export function notFound() {
  return json({ error: "not_found" }, 404);
}

export function badRequest(issues?: unknown) {
  return json({ error: "bad_request", issues }, 400);
}

export async function parseBody<T extends z.ZodTypeAny>(req: NextRequest, schema: T): Promise<{ ok: true; data: z.infer<T> } | { ok: false; res: NextResponse }> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return { ok: false, res: badRequest("invalid_json") };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, res: badRequest(parsed.error.flatten()) };
  return { ok: true, data: parsed.data };
}

export function deviceFromRequest(req: NextRequest): string | null {
  const header = req.headers.get(DEVICE_HEADER);
  const parsed = deviceHashSchema.safeParse(header);
  return parsed.success ? parsed.data : null;
}

/** يغلّف المعالج: يحوّل تحديد المعدّل إلى 429 صامت وأي خطأ آخر إلى 500 بلا تفاصيل */
export function handle(fn: () => Promise<NextResponse>): Promise<NextResponse> {
  return fn().catch((error: unknown) => {
    if (error instanceof RateLimited) return rateLimited();
    console.error("[api]", error instanceof Error ? error.message : "unknown_error");
    return json({ error: "server_error" }, 500);
  });
}

/** مسارات اللوحة: جلسة موقّعة، وكل نداء يُسجَّل */
export async function requireAdmin(req: NextRequest, action: string): Promise<NextResponse | null> {
  if (!(await isAdmin())) return json({ error: "unauthorized" }, 401);
  await audit({ actorRole: "ambassador", action: `admin.${action}`, entity: "api", entityId: req.nextUrl.pathname });
  return null;
}

export const uuidSchema = z.string().uuid();
