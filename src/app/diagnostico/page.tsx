import type { Metadata } from "next";
import Link from "next/link";
import { LogoLockup } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AssessmentFlow } from "@/components/assessment/assessment-flow";

export const metadata: Metadata = {
  title: "Diagnóstico de Madurez Digital",
  description:
    "Responde el cuestionario y descubre la madurez digital de tu empresa en 8 dimensiones.",
};

export default function DiagnosticoPage() {
  return (
    <>
      <header className="no-print sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
          <Link href="/" aria-label="Radar Digital — inicio">
            <LogoLockup />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-sm text-faint">Diagnóstico</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <AssessmentFlow />
      </main>
    </>
  );
}
