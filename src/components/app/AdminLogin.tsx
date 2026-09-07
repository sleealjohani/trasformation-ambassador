"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/States";
import { apiSend, errorMessage } from "@/lib/api";

export function AdminLogin() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function login() {
    setBusy(true);
    setError(null);
    try {
      await apiSend<{ ok: true }>("/api/admin/login", { passcode });
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(errorMessage(err) === "لا توجد نتيجة." ? "رمز غير صحيح." : "رمز غير صحيح.");
      setBusy(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-3 rounded-card border border-line bg-panel p-4"
      onSubmit={(e) => {
        e.preventDefault();
        void login();
      }}
    >
      <label htmlFor="passcode" className="text-card-title font-bold text-ink">
        رمز الدخول
      </label>
      <input
        id="passcode"
        type="password"
        value={passcode}
        onChange={(e) => setPasscode(e.target.value)}
        autoComplete="off"
        className="w-full rounded-button border border-line bg-panel-2 px-4 py-3 text-body text-ink outline-none focus-visible:border-hh-2736"
      />
      <Button type="submit" full disabled={busy || passcode.length === 0}>
        {busy ? "جارٍ التحقق…" : "دخول"}
      </Button>
      {error ? <ErrorState text={error} /> : null}
    </form>
  );
}
