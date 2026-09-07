"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        void fetch("/api/admin/logout", { method: "POST" }).then(() => {
          router.replace("/admin/login");
          router.refresh();
        });
      }}
      className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-button border border-on-dark px-3 text-secondary text-on-dark"
    >
      <Icon name="close" size={16} />
      <span>خروج</span>
    </button>
  );
}
