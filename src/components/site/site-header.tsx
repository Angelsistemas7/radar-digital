import Link from "next/link";
import { LogoLockup } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link href="/" aria-label="Radar Digital — inicio">
          <LogoLockup />
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-muted md:flex">
          <a href="/#como" className="transition-colors hover:text-foreground">
            Cómo funciona
          </a>
          <a href="/#dimensiones" className="transition-colors hover:text-foreground">
            Dimensiones
          </a>
          <a href="/#resultado" className="transition-colors hover:text-foreground">
            Qué obtienes
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="hidden rounded-lg px-3 py-2 text-sm text-faint transition-colors hover:text-muted sm:block"
          >
            Admin
          </Link>
          <Link href="/diagnostico" className={buttonClasses("primary", "sm")}>
            Iniciar diagnóstico
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
