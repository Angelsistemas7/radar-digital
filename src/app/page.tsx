import Link from "next/link";
import { ClipboardList, TrafficCone, Rocket, ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/ui/reveal";
import { DimensionIcon } from "@/components/ui/dimension-icon";
import { SemaforoCycle } from "@/components/ui/semaforo";
import { buttonClasses } from "@/components/ui/button";
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
    title: "Descarga y comparte",
    text: "Un resultado claro por colores y los próximos pasos para avanzar, listo para descargar y compartir.",
  },
];

// Color de cada paso (teal · índigo · verde) para el ícono y el realce.
const STEP_COLORS = ["#0e7490", "#4f46e5", "#16a34a"];

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

        {/* Cómo funciona */}
        <section id="como" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
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
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="group card-hover glass relative h-full overflow-hidden rounded-2xl p-7">
                  {/* top accent in the step color */}
                  <span aria-hidden className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: c }} />
                  {/* colored corner glow — hover on desktop, subtle always on mobile */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 max-sm:opacity-60"
                    style={{ backgroundColor: `${c}33` }}
                  />
                  <div
                    className="relative flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                    style={{ backgroundColor: `${c}1f`, color: c, boxShadow: `0 6px 16px -8px ${c}` }}
                  >
                    <step.icon className="size-6" />
                  </div>
                  <div className="relative mt-5 flex items-center gap-2">
                    <span className="font-mono text-sm text-faint">0{i + 1}</span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="relative mt-2 text-muted">{step.text}</p>
                </div>
              </Reveal>
              );
            })}
          </div>
        </section>

        {/* Dimensiones */}
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
              {DIMENSIONS.map((d, i) => (
                <Reveal key={d.id} delay={(i % 4) * 0.08}>
                  <div className="group card-hover glass relative h-full overflow-hidden rounded-2xl p-6">
                    <span
                      aria-hidden
                      className="absolute inset-x-0 top-0 h-1 origin-left scale-x-100 transition-transform duration-300"
                      style={{ backgroundColor: d.color }}
                    />
                    {/* soft corner glow that warms up on hover */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 max-sm:opacity-60"
                      style={{ backgroundColor: `${d.color}33` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <span
                        className="flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:scale-110"
                        style={{
                          backgroundColor: `${d.color}1f`,
                          color: d.color,
                          boxShadow: `0 6px 16px -8px ${d.color}`,
                        }}
                      >
                        <DimensionIcon name={d.icon} className="size-5" />
                      </span>
                      <span className="font-mono text-xs text-faint">
                        Área {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="relative mt-4 font-semibold">{d.title}</h3>
                    <p className="relative mt-1.5 text-sm text-muted">{d.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

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
            <Reveal delay={0.1}>
              <Eyebrow>Qué obtienes</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Un autodiagnóstico que se convierte en acción
              </h2>
              <p className="mt-4 text-muted">
                No solo un puntaje: una lectura clara de dónde estás y qué hacer a
                continuación.
              </p>
              <ul className="mt-6 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                      <Check className="size-3.5" />
                    </span>
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/diagnostico"
                className={buttonClasses("primary", "md", "mt-8")}
              >
                Empezar ahora <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-6xl px-5 pb-24">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-gradient-to-br from-elevated to-surface p-10 text-center sm:p-14">
              <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
              <div className="relative">
                <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                  Haz el autodiagnóstico digital de tu empresa hoy
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted">
                  Gratis, sin registro y con resultado inmediato. Comparte el
                  enlace y que todo tu equipo o tus aliados midan su semáforo
                  digital.
                </p>
                <Link
                  href="/diagnostico"
                  className={buttonClasses("primary", "lg", "mt-8")}
                >
                  Iniciar autodiagnóstico <ArrowRight className="size-5" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
