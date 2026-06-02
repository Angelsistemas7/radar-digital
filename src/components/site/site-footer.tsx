import Link from "next/link";
import { LogoLockup } from "@/components/ui/logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-faint sm:flex-row">
        <LogoLockup />
        <p className="text-center sm:text-right">
          Diagnóstico de madurez digital · Datos tratados conforme a la Ley 1581
          de 2012 (Habeas Data).
          <br className="hidden sm:block" />
          <span className="text-muted">
            © {new Date().getFullYear()} Radar Digital.
          </span>{" "}
          <Link href="/privacidad" className="underline-offset-4 hover:text-muted hover:underline">
            Privacidad
          </Link>
          {" · "}
          <Link href="/terminos" className="underline-offset-4 hover:text-muted hover:underline">
            Términos
          </Link>
          {" · "}
          <Link href="/admin" className="underline-offset-4 hover:text-muted hover:underline">
            Admin
          </Link>
        </p>
      </div>
    </footer>
  );
}
