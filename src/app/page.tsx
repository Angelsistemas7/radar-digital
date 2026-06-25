import Link from "next/link";
import { ClipboardList, TrafficCone, Rocket, ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/landing/hero";
import { FloatingCard } from "@/components/landing/floating-card";
import { Reveal } from "@/components/ui/reveal";
import { DimensionIcon } from "@/components/ui/dimension-icon";
import { SemaforoCycle, AmbientSection } from "@/components/ui/semaforo";
import { ShineOverlay } from "@/components/ui/shine";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DIMENSIONS } from "@/lib/questionnaire";
import { totalQuestions } from "@/lib/scoring";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Responde el autodiagnóstico",
    text: `${totalQuestions()} preguntas en ${DIMENSIONS.length} dimensiones. Respondes con un semáforo: verde (sí), amarillo (más o menos) o rojo (no). Te toma unos 5 minutos.`,
  },
  {
    icon: TrafficCone,
    title: "Mira tu semáforo digital",
    text: "Al instante obtienes tu semáforo —rojo, amarillo o verde— con tus fortalezas y tus áreas por reforzar.",
  },
  {
    icon: Rocket,
    title: "Comparte tu resultado",
    text: "Un resultado claro por colores con los próximos pasos para avanzar, listo para compartir con tu equipo.",
  },
];

const STEP_COLORS = ["#0fc5ed", "#1d4ed8", "#0d9488"];

const FEATURES = [
  "Autodiagnóstico visual de las 4 dimensiones",
  "Tu nivel de madurez por colores: rojo, amarillo o verde",
  "Tu área más fuerte y la que debes reforzar",
  "Comparación con el promedio de tu sector",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />

        {/* Cómo funciona — color ambiental sutil */}
        <AmbientSection strength={0.4}>
          <section id="como" className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>Cómo funciona</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Tres pasos hacia tu transformación digital
              </h2>
            </Reveal>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {STEPS.map((step, i) => {
                const c = STEP_COLORS[i] ?? "#0e7490";
                return (
                  <Reveal key={step.title} delay={i * 0.2} duration={0.8}>
                    <div
                      className="group relative h-full overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
                      style={{
                        background:
                          "linear-gradient(155deg, color-mix(in oklab, var(--color-primary) 82%, #03103a) 0%, color-mix(in oklab, var(--color-primary) 38%, #03103a) 100%)",
                        boxShadow: "0 22px 44px -26px rgba(0,0,0,0.55)",
                      }}
                    >
                      {/* glow de acento en el color del paso */}
                      <span
                        aria-hidden
                        className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-75"
                        style={{ backgroundColor: c }}
                      />
                      <span
                        className="relative flex size-12 items-center justify-center rounded-2xl text-white ring-1 ring-white/25 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                        style={{ backgroundColor: c, boxShadow: `0 8px 20px -8px ${c}` }}
                      >
                        <step.icon className="size-6" />
                      </span>
                      <div className="relative mt-5 flex items-center gap-2">
                        <span className="font-mono text-sm text-white/40">0{i + 1}</span>
                        <h3 className="text-base font-bold text-white">{step.title}</h3>
                      </div>
                      <p className="relative mt-2 text-sm leading-relaxed text-white/70">
                        {step.text}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </section>
        </AmbientSection>

        {/* Dimensiones — color ambiental ligeramente más suave */}
        <AmbientSection strength={0.65}>
          <section
            id="dimensiones"
            className="relative scroll-mt-20 border-y border-border/60 bg-surface/40 py-20"
          >
            <div className="mx-auto max-w-6xl px-5">
              <Reveal className="mx-auto max-w-2xl text-center">
                <Eyebrow>Las 4 dimensiones</Eyebrow>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Evaluamos tu madurez digital de forma integral
                </h2>
                <p className="mt-4 text-muted">
                  Cada dimensión es un área de tu semáforo. Juntas dibujan el mapa
                  completo de la transformación digital de tu empresa.
                </p>
              </Reveal>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {DIMENSIONS.map((d, i) => {
                  /* cascada por filas: 0+1 primero, 2+3 después */
                  const delay = Math.floor(i / 2) * 0.25 + (i % 2) * 0.1;
                  return (
                    <Reveal key={d.id} delay={delay} duration={0.7}>
                      <div
                        className="group relative h-full overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1.5"
                        style={{
                          background:
                            "linear-gradient(155deg, color-mix(in oklab, var(--color-primary) 82%, #03103a) 0%, color-mix(in oklab, var(--color-primary) 38%, #03103a) 100%)",
                          boxShadow: "0 22px 44px -26px rgba(0,0,0,0.55)",
                        }}
                      >
                        {/* glow de acento en el color de la dimensión */}
                        <span
                          aria-hidden
                          className="pointer-events-none absolute -right-12 -top-12 size-32 rounded-full opacity-40 blur-3xl transition-opacity duration-300 group-hover:opacity-75"
                          style={{ backgroundColor: d.color }}
                        />
                        <div className="relative flex items-center justify-between">
                          <span
                            className="flex size-12 items-center justify-center rounded-2xl text-white ring-1 ring-white/25 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                            style={{
                              backgroundColor: d.color,
                              boxShadow: `0 8px 20px -8px ${d.color}`,
                            }}
                          >
                            <DimensionIcon name={d.icon} className="size-6" />
                          </span>
                          <span className="font-mono text-xs text-white/40">
                            Área {String(i + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <h3 className="relative mt-5 text-lg font-bold text-white">{d.title}</h3>
                        <p className="relative mt-2 text-sm leading-relaxed text-white/70">
                          {d.description}
                        </p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </section>
        </AmbientSection>

        {/* Qué obtienes */}
        <section
          id="resultado"
          className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20"
        >
          <div className="grid items-center gap-12 md:grid-cols-2">
            <Reveal>
              <div className="glass glow-accent flex items-center justify-center rounded-3xl p-10">
                <SemaforoCycle size="xl" />
              </div>
            </Reveal>
            <div>
              <Reveal delay={0.1}>
                <Eyebrow>Qué obtienes</Eyebrow>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Un autodiagnóstico que se convierte en acción
                </h2>
                <p className="mt-4 text-muted">
                  No solo un puntaje: una lectura clara de dónde estás y qué hacer a
                  continuación.
                </p>
              </Reveal>
              <ul className="mt-6 space-y-3">
                {FEATURES.map((f, i) => (
                  <Reveal key={f} delay={0.2 + i * 0.1} duration={0.6}>
                    <li className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                        <Check className="size-3.5" />
                      </span>
                      <span className="text-foreground/90">{f}</span>
                    </li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA final — flotante y más compacto */}
        <section className="mx-auto max-w-4xl px-5 pb-24">
          <Reveal>
            <FloatingCard>
              <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-gradient-to-br from-elevated to-surface p-8 text-center sm:p-12">
                <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
                <div className="relative">
                  <h2 className="mx-auto max-w-xl text-3xl font-bold tracking-tight sm:text-4xl">
                    Haz el autodiagnóstico digital de tu empresa hoy
                  </h2>
                  <p className="mx-auto mt-4 max-w-md text-muted">
                    Gratis, sin registro y con resultado inmediato. Comparte el
                    enlace y que todo tu equipo o tus aliados midan su semáforo
                    digital.
                  </p>
                  <Link
                    href="/diagnostico"
                    className={cn(buttonClasses("primary", "lg", "mt-8"), "relative overflow-hidden")}
                  >
                    Iniciar autodiagnóstico <ArrowRight className="size-5" />
                    <ShineOverlay delay={4} />
                  </Link>
                </div>
              </div>
            </FloatingCard>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
