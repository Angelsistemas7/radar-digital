import Link from "next/link";
import { ClipboardList, Radar, Rocket, ArrowRight, Check } from "lucide-react";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { Hero } from "@/components/landing/hero";
import { Reveal } from "@/components/ui/reveal";
import { DimensionIcon } from "@/components/ui/dimension-icon";
import { RadarChart } from "@/components/results/radar-chart";
import { buttonClasses } from "@/components/ui/button";
import { DIMENSIONS } from "@/lib/questionnaire";
import { totalQuestions } from "@/lib/scoring";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Responde el cuestionario",
    text: `${totalQuestions()} preguntas en ${DIMENSIONS.length} dimensiones. Respondes con un semáforo: verde (sí), amarillo (más o menos) o rojo (no). Te toma unos 5 minutos.`,
  },
  {
    icon: Radar,
    title: "Visualiza tu radar",
    text: "Obtén al instante un radar interactivo que revela tus fortalezas y debilidades digitales.",
  },
  {
    icon: Rocket,
    title: "Recibe tu plan de acción",
    text: "Un diagnóstico claro y un plan por fases (0–3, 3–6 y 6–12 meses) para avanzar con paso firme.",
  },
];

const FEATURES = [
  "Radar interactivo de las 8 dimensiones",
  "Fortalezas y debilidades priorizadas",
  "Nivel de madurez: de Incipiente a Líder Digital",
  "Plan de acción por fases (0–3, 3–6, 6–12 meses)",
  "Recomendaciones concretas para cada dimensión",
  "Listo para integrar un chatbot con IA (próximamente)",
];

const SAMPLE = DIMENSIONS.map((d, i) => ({
  label: d.name,
  color: d.color,
  value: [7.6, 5.1, 8.3, 4.2, 6.7, 5.6, 7.2, 4.0][i] ?? 6,
}));

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
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="card-hover glass h-full rounded-2xl p-7">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <step.icon className="size-6" />
                  </div>
                  <div className="mt-5 flex items-center gap-2">
                    <span className="font-mono text-sm text-faint">
                      0{i + 1}
                    </span>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                  </div>
                  <p className="mt-2 text-muted">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Dimensiones */}
        <section
          id="dimensiones"
          className="relative scroll-mt-20 border-y border-border/60 bg-surface/40 py-20"
        >
          <div className="mx-auto max-w-6xl px-5">
            <Reveal className="mx-auto max-w-2xl text-center">
              <Eyebrow>Las 8 dimensiones</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Evaluamos tu madurez digital de forma integral
              </h2>
              <p className="mt-4 text-muted">
                Cada dimensión es un eje de tu radar. Juntas dibujan el mapa
                completo de la transformación digital de tu empresa.
              </p>
            </Reveal>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {DIMENSIONS.map((d, i) => (
                <Reveal key={d.id} delay={(i % 4) * 0.08}>
                  <div className="card-hover glass h-full rounded-2xl p-6">
                    <div
                      className="flex size-11 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${d.color}1f`, color: d.color }}
                    >
                      <DimensionIcon name={d.icon} className="size-5" />
                    </div>
                    <h3 className="mt-4 font-semibold">{d.title}</h3>
                    <p className="mt-1.5 text-sm text-muted">{d.description}</p>
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
              <div className="glass glow-accent rounded-3xl p-6">
                <RadarChart data={SAMPLE} showLabels size={360} animate={false} />
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Eyebrow>Qué obtienes</Eyebrow>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Un diagnóstico que se convierte en acción
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
                  Descubre la madurez digital de tu empresa hoy
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-muted">
                  Gratis, sin registro y con resultado inmediato. Comparte el
                  enlace y mide a todo tu equipo o tus aliados.
                </p>
                <Link
                  href="/diagnostico"
                  className={buttonClasses("primary", "lg", "mt-8")}
                >
                  Iniciar diagnóstico <ArrowRight className="size-5" />
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
