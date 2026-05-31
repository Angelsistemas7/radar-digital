"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
        router.replace("/admin/login");
        router.refresh();
      }}
      className={buttonClasses("ghost", "sm")}
    >
      <LogOut className="size-4" /> Salir
    </button>
  );
}
