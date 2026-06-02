"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { RotateCcw, Home } from "lucide-react";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <Logo size={48} />
      <h1 className="mt-6 text-2xl font-bold tracking-tight">Algo salió mal</h1>
      <p className="mt-2 max-w-sm text-muted">
        Tuvimos un problema inesperado. Puedes reintentar o volver al inicio.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => reset()} className={buttonClasses("primary", "md")}>
          <RotateCcw className="size-4" /> Reintentar
        </button>
        <Link href="/" className={buttonClasses("secondary", "md")}>
          <Home className="size-4" /> Inicio
        </Link>
      </div>
    </main>
  );
}
