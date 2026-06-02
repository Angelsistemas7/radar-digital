import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { buttonClasses } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-24 text-center">
      <Logo size={48} />
      <p className="mt-6 font-mono text-sm text-primary">404</p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Página no encontrada</h1>
      <p className="mt-2 max-w-sm text-muted">
        La página que buscas no existe o fue movida.
      </p>
      <Link href="/" className={buttonClasses("primary", "md", "mt-6")}>
        <ArrowLeft className="size-4" /> Volver al inicio
      </Link>
    </main>
  );
}
