import Link from "next/link";
import { LogoLockup } from "@/components/ui/logo";
import { BRAND } from "@/lib/brand";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-faint sm:flex-row">
        <div className="flex items-center gap-3 sm:gap-4">
          <LogoLockup />
          {BRAND.partnerLogo && (
            <>
              <span aria-hidden className="h-8 w-px bg-border" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={BRAND.partnerLogo}
                alt={BRAND.partnerName ?? ""}
                className="h-9 w-auto"
              />
            </>
          )}
        </div>
        <p className="text-center sm:text-right">
          Autodiagnóstico de madurez digital · Datos tratados conforme a la Ley 1581
          de 2012 (Habeas Data).
          <br className="hidden sm:block" />
          <span className="text-muted">
            © {new Date().getFullYear()} {BRAND.legalEntity}.
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
