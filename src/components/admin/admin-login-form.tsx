"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, AlertCircle, LogIn } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";

export function AdminLoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "No se pudo iniciar sesión");
        setLoading(false);
        return;
      }
      router.replace(next && next.startsWith("/") ? next : "/admin");
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="glass w-full max-w-sm rounded-3xl p-7">
      <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
        <Lock className="size-6" />
      </div>
      <h1 className="text-xl font-bold tracking-tight">Acceso administrador</h1>
      <p className="mt-1 text-sm text-muted">
        Ingresa la contraseña para ver el panel de datos.
      </p>

      <label className="mt-6 mb-1.5 block text-sm font-medium text-foreground/90">
        Contraseña
      </label>
      <input
        type="password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        className="w-full rounded-xl border border-border bg-surface/70 px-3.5 py-2.5 text-sm outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
      />

      {error && (
        <p className="mt-3 flex items-center gap-1.5 text-sm text-danger">
          <AlertCircle className="size-4 shrink-0" />
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !password}
        className={buttonClasses("primary", "md", "mt-6 w-full")}
      >
        {loading ? "Verificando…" : <>Entrar <LogIn className="size-4" /></>}
      </button>
    </form>
  );
}
