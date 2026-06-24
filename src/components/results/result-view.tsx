"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import {
  Trophy,
  TriangleAlert,
  RotateCcw,
  CheckCircle2,
  Handshake,
  Rocket,
  Loader2,
  Gauge,
  TrendingUp,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { DimensionIcon } from "@/components/ui/dimension-icon";
import { Semaforo } from "@/components/ui/semaforo";
import { Reveal } from "@/components/ui/reveal";
import { BRAND } from "@/lib/brand";
import { buttonClasses } from "@/components/ui/button";
import { generateDiagnosis } from "@/lib/diagnosis";
import { clearState } from "@/lib/storage";
import { levelForScore, levelIndexForScore } from "@/lib/scoring";
import { QUESTIONNAIRE } from "@/lib/questionnaire";
import { scoreColor } from "@/lib/utils";
import type { AssessmentResult, DimensionScore } from "@/lib/types";

/** Color word for a 0-10 score, aligned with the traffic-light bands. */
function colorWord(score: number): string {
  return (["rojo", "amarillo", "verde"] as const)[levelIndexForScore(score)];
}

function dimMeta(dimensionId: string) {
  const d = QUESTIONNAIRE.dimensions.find((x) => x.id === dimensionId);
  return { icon: d?.icon ?? "", description: d?.description ?? "", title: d?.title ?? "" };
}

/* ---------- per-dimension state card (color = its state) ---------- */
function SectionState({ d, index }: { d: DimensionScore; index: number }) {
  const color = scoreColor(d.score);
  const state = levelForScore(d.score).name;
  const meta = dimMeta(d.dimensionId);
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.15 + index * 0.07, duration: 0.4, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm"
      style={{ borderColor: `${color}59` }}
    >
      {/* color accent strip + soft wash for contrast */}
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: color }} />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: `linear-gradient(120deg, ${color}14, transparent 60%)` }}
      />
      <div className="relative">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${color}24`, color }}
          >
            <DimensionIcon name={meta.icon} className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-bold leading-tight text-foreground">
              {meta.title}
            </p>
            <p className="text-xs font-semibold" style={{ color }}>
              {state}
            </p>
          </div>
          <span
            className="size-3 shrink-0 rounded-full"
            style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}
            aria-hidden
          />
        </div>
        <p className="mt-2 line-clamp-2 text-xs leading-snug text-muted">
          {meta.description}
        </p>
      </div>
    </motion.div>
  );
}

function Widget({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="glass card-hover rounded-2xl p-3.5 sm:p-4">
      <div className="flex items-start gap-2">
        <span
          className="flex size-7 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon className="size-4" />
        </span>
        <p className="text-[10px] font-semibold uppercase leading-tight tracking-[0.1em] text-faint sm:text-[11px] sm:tracking-[0.12em]">
          {label}
        </p>
      </div>
      <p
        className="mt-2.5 font-display text-base font-bold leading-tight sm:text-lg"
        style={{ color }}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs leading-snug text-muted">{sub}</p>}
    </div>
  );
}

export function ResultView({
  result,
  company,
  sector,
  email,
  onRestart,
}: {
  result: AssessmentResult;
  company?: string;
  sector?: string;
  email?: string;
  onRestart?: () => void;
}) {
  const diagnosis = generateDiagnosis(result, { company: company ?? "" });

  const [compareOverall, setCompareOverall] = useState<number | null>(null);
  const [sending, setSending] = useState(false);

  const handleFinish = async () => {
    if (sending) return;
    setSending(true);
    try {
      if (email) {
        // Contact is always requested now — no opt-in toggle.
        await fetch("/api/contacto", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, wantsContact: true }),
        });
      }
    } catch {
      /* never block on a hiccup — the diagnosis is already saved */
    }
    // The submission was already saved when the questionnaire finished.
    // Clear the in-progress state and return to the home screen.
    clearState();
    window.location.href = "/";
  };

  useEffect(() => {
    let active = true;
    fetch(`/api/benchmark?sector=${encodeURIComponent(sector ?? "")}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { overall?: number } | null) => {
        if (active && typeof d?.overall === "number") setCompareOverall(d.overall);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sector]);

  // Qualitative comparison vs the sector average (no figures).
  const vsSector =
    compareOverall == null
      ? null
      : result.overall - compareOverall >= 0.3
        ? { label: "Por encima del promedio", color: "#059669", icon: TrendingUp }
        : result.overall - compareOverall <= -0.3
          ? { label: "Por debajo del promedio", color: "#dc2626", icon: TrendingDown }
          : { label: "En el promedio", color: "#d97706", icon: Gauge };

  return (
    <div className="space-y-6">
      {/* print-only report header */}
      <div className="mb-6 hidden print:block">
        <div className="flex items-center justify-between border-b border-[#d9dee8] pb-3">
          <span className="font-display text-lg font-bold">{BRAND.name}</span>
          <span className="text-sm">
            Reporte de Madurez Digital ·{" "}
            {new Date().toLocaleDateString("es-CO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        {company && (
          <p className="mt-2 text-sm">
            Empresa: <strong>{company}</strong>
            {sector ? ` · Sector: ${sector}` : ""}
          </p>
        )}
      </div>

      {/* headline: traffic light (left) + sections by state (right) */}
      <Reveal>
        <div className="glass glow-primary relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
          <div className="relative grid items-center gap-8 lg:grid-cols-[auto_1fr]">
            {/* left: big gradual traffic light + level */}
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center lg:flex-col lg:items-center">
              <Semaforo score={result.overall} pulse />
              <div className="text-center sm:text-left lg:max-w-[18rem] lg:text-center">
                {company && (
                  <p className="text-sm text-muted">
                    Resultado para{" "}
                    <span className="font-semibold text-foreground">{company}</span>
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center justify-center gap-2.5 sm:justify-start lg:justify-center">
                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Nivel {result.level.name}
                  </h1>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: `${result.level.color}1f`,
                      color: result.level.color,
                    }}
                  >
                    {result.level.tagline}
                  </span>
                </div>
                <p className="mt-3 text-muted">{result.level.description}</p>
              </div>
            </div>

            {/* right: the 4 sections, each colored by its state */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {result.dimensions.map((d, i) => (
                <SectionState key={d.dimensionId} d={d} index={i} />
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      {/* qualitative widgets (no figures) */}
      <Reveal className="print:hidden">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Widget
            icon={Gauge}
            label="Nivel de madurez"
            value={result.level.name}
            sub={`En ${colorWord(result.overall)}`}
            color={result.level.color}
          />
          <Widget
            icon={Trophy}
            label="Área más fuerte"
            value={result.strengths[0]?.name ?? "—"}
            sub="tu punto fuerte"
            color="#059669"
          />
          <Widget
            icon={TriangleAlert}
            label="Qué reforzar"
            value={result.weaknesses[0]?.name ?? "—"}
            sub="tu punto débil"
            color="#dc2626"
          />
          <Widget
            icon={vsSector?.icon ?? Gauge}
            label="Vs tu sector"
            value={vsSector?.label ?? "Calculando…"}
            sub="frente a tu sector"
            color={vsSector?.color ?? "#0e7490"}
          />
        </div>
      </Reveal>

      {/* finish + lead capture */}
      <Reveal className="no-print">
        <div className="glass glow-accent relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <Handshake className="size-5 text-accent" />
              <h2 className="text-xl font-bold tracking-tight">Da el siguiente paso</h2>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Nuestro equipo te contactará para acompañarte a convertir este autodiagnóstico
              en resultados reales.
            </p>

            <ul className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                {
                  t: "Asesoría personalizada",
                  d: "Interpretamos tus resultados contigo, paso a paso.",
                },
                {
                  t: "Plan a tu medida",
                  d: "Una hoja de ruta adaptada a tu empresa y tu sector.",
                },
                {
                  t: "Acceso prioritario",
                  d: "Talleres, recursos y herramientas para avanzar más rápido.",
                },
              ].map((b) => (
                <li
                  key={b.t}
                  className="rounded-2xl border border-border/70 bg-surface/40 p-4"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-success" />
                    <span className="text-sm font-semibold">{b.t}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{b.d}</p>
                </li>
              ))}
            </ul>

            <div className="mt-7 flex flex-col items-stretch gap-2 border-t border-border/60 pt-5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              {onRestart && (
                <button
                  type="button"
                  onClick={onRestart}
                  className={buttonClasses("ghost", "md")}
                >
                  <RotateCcw className="size-4" /> Repetir test
                </button>
              )}
              <button
                type="button"
                onClick={handleFinish}
                disabled={sending}
                className={buttonClasses("primary", "md")}
              >
                {sending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Rocket className="size-4" />
                )}
                {sending ? "Guardando…" : "Terminar"}
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
