import { ADMIN_COOKIE } from "@/server/admin-session";
import { json } from "@/server/http";

export async function POST() {
  const res = json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
