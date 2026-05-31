"use client";

import { useEffect, useState } from "react";
import { motion, animate, useMotionValue } from "motion/react";
import {
  Trophy,
  TriangleAlert,
  Download,
  RotateCcw,
  CalendarCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { RadarChart } from "./radar-chart";
import { AiAdvisor } from "./ai-advisor";
import { DimensionIcon } from "@/components/ui/dimension-icon";
import { Reveal } from "@/components/ui/reveal";
import { buttonClasses } from "@/components/ui/button";
import { generateDiagnosis } from "@/lib/diagnosis";
import { QUESTIONNAIRE } from "@/lib/questionnaire";
import { cn, formatScore } from "@/lib/utils";
import type { AssessmentResult, DimensionScore, RecommendationBand } from "@/lib/types";

/* ---------- animated number ---------- */
function CountUp({ value, decimals = 1 }: { value: number; decimals?: number }) {
  const mv = useMotionValue(0);
  const [text, setText] = useState((0).toFixed(decimals));
  useEffect(() => {
    const controls = animate(mv, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (v) => setText(v.toFixed(decimals)),
    });
    return () => controls.stop();
  }, [value, decimals, mv]);
  return <>{text.replace(".", ",")}</>;
}

/* ---------- circular score gauge ---------- */
function ScoreRing({
  score,
  color,
  size = 184,
}: {
  score: number;
  color: string;
  size?: number;
}) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(score / QUESTIONNAIRE.scale.max, 0), 1);

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#141d31" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold tracking-tight" style={{ color }}>
          <CountUp value={score} />
        </span>
        <span className="text-sm text-faint">de 10</span>
      </div>
    </div>
  );
}

/* ---------- dimension score bars ---------- */
function DimensionBars({ dimensions }: { dimensions: DimensionScore[] }) {
  const sorted = [...dimensions].sort((a, b) => b.score - a.score);
  return (
    <div className="space-y-3.5">
      {sorted.map((d, i) => (
        <div key={d.dimensionId}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-foreground/90">{d.name}</span>
            <span className="font-semibold tabular-nums" style={{ color: d.color }}>
              {formatScore(d.score)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-elevated">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: d.color }}
              initial={{ width: 0 }}
              animate={{ width: `${(d.score / 10) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.2 + i * 0.05, ease: "easeOut" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const BAND_TAG: Record<RecommendationBand, { label: string; cls: string }> = {
  low: { label: "Prioridad alta", cls: "bg-danger/15 text-danger" },
  medium: { label: "Por mejorar", cls: "bg-warning/15 text-warning" },
  high: { label: "Fortaleza", cls: "bg-success/15 text-success" },
};

const PRIORITY_TAG = {
  alta: "bg-danger/15 text-danger",
  media: "bg-warning/15 text-warning",
  baja: "bg-success/15 text-success",
} as const;

export function ResultView({
  result,
  company,
  sector,
  onRestart,
}: {
  result: AssessmentResult;
  company?: string;
  sector?: string;
  onRestart?: () => void;
}) {
  const diagnosis = generateDiagnosis(result, { company: company ?? "" });
  const radarData = result.dimensions.map((d) => ({
    label: d.name,
    value: d.score,
    color: d.color,
  }));

  return (
    <div className="space-y-6">
      {/* print-only report header */}
      <div className="mb-6 hidden print:block">
        <div className="flex items-center justify-between border-b border-[#d9dee8] pb-3">
          <span className="font-display text-lg font-bold">Radar Digital</span>
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

      {/* headline result */}
      <Reveal>
        <div className="glass glow-primary relative overflow-hidden rounded-3xl p-6 sm:p-8">
          <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
          <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
            <ScoreRing score={result.overall} color={result.level.color} />
            <div className="text-center sm:text-left">
              {company && (
                <p className="text-sm text-muted">
                  Resultado para{" "}
                  <span className="font-semibold text-foreground">{company}</span>
                </p>
              )}
              <div className="mt-1 flex flex-wrap items-center justify-center gap-3 sm:justify-start">
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
              <p className="mt-3 max-w-lg text-muted">{result.level.description}</p>
              <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm sm:justify-start">
                <span className="text-muted">
                  Más fuerte:{" "}
                  <span className="font-semibold text-success">
                    {result.strengths[0]?.name}
                  </span>
                </span>
                <span className="text-muted">
                  A reforzar:{" "}
                  <span className="font-semibold text-danger">
                    {result.weaknesses[0]?.name}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* radar + bars */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="glass h-full rounded-3xl p-6">
            <h2 className="mb-2 text-lg font-semibold">Tu radar digital</h2>
            <RadarChart data={radarData} size={380} />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="glass h-full rounded-3xl p-6">
            <h2 className="mb-5 text-lg font-semibold">Puntaje por dimensión</h2>
            <DimensionBars dimensions={result.dimensions} />
          </div>
        </Reveal>
      </div>

      {/* strengths / weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal>
          <div className="glass h-full rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <Trophy className="size-5 text-success" />
              <h2 className="text-lg font-semibold">Tus fortalezas</h2>
            </div>
            <ul className="space-y-3">
              {result.strengths.map((d) => (
                <li key={d.dimensionId} className="flex items-center gap-3">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${d.color}1f`, color: d.color }}
                  >
                    <DimensionIcon
                      name={
                        QUESTIONNAIRE.dimensions.find((x) => x.id === d.dimensionId)
                          ?.icon ?? ""
                      }
                      className="size-4"
                    />
                  </span>
                  <span className="flex-1 text-foreground/90">{d.name}</span>
                  <span className="font-semibold text-success">{formatScore(d.score)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="glass h-full rounded-3xl p-6">
            <div className="mb-4 flex items-center gap-2">
              <TriangleAlert className="size-5 text-danger" />
              <h2 className="text-lg font-semibold">Áreas a reforzar</h2>
            </div>
            <ul className="space-y-3">
              {result.weaknesses.map((d) => (
                <li key={d.dimensionId} className="flex items-center gap-3">
                  <span
                    className="flex size-9 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${d.color}1f`, color: d.color }}
                  >
                    <DimensionIcon
                      name={
                        QUESTIONNAIRE.dimensions.find((x) => x.id === d.dimensionId)
                          ?.icon ?? ""
                      }
                      className="size-4"
                    />
                  </span>
                  <span className="flex-1 text-foreground/90">{d.name}</span>
                  <span className="font-semibold text-danger">{formatScore(d.score)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* diagnosis */}
      <Reveal>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <h2 className="text-xl font-bold tracking-tight">Diagnóstico</h2>
          </div>
          <p className="max-w-3xl text-muted">{diagnosis.summary}</p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {diagnosis.perDimension.map((d) => (
              <div key={d.dimensionId} className="rounded-2xl border border-border/70 bg-surface/40 p-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${d.color}1f`, color: d.color }}
                    >
                      <DimensionIcon
                        name={
                          QUESTIONNAIRE.dimensions.find((x) => x.id === d.dimensionId)
                            ?.icon ?? ""
                        }
                        className="size-4"
                      />
                    </span>
                    <h3 className="font-semibold">{d.name}</h3>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-xs font-medium",
                      BAND_TAG[d.band].cls,
                    )}
                  >
                    {BAND_TAG[d.band].label} · {formatScore(d.score)}
                  </span>
                </div>
                <ul className="mt-3 space-y-2">
                  {d.recommendations.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted">
                      <ArrowRight className="mt-0.5 size-4 shrink-0" style={{ color: d.color }} />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* action plan */}
      <Reveal>
        <div className="glass rounded-3xl p-6 sm:p-8">
          <div className="mb-1 flex items-center gap-2">
            <CalendarCheck className="size-5 text-accent" />
            <h2 className="text-xl font-bold tracking-tight">Tu plan de acción</h2>
          </div>
          <p className="mb-6 text-sm text-muted">
            Una hoja de ruta por fases para avanzar de lo urgente a lo estratégico.
          </p>
          <div className="grid gap-5 lg:grid-cols-3">
            {diagnosis.plan.map((phase, pi) => (
              <Reveal key={phase.id} delay={pi * 0.1}>
                <div className="h-full rounded-2xl border border-border/70 bg-surface/40 p-6">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-accent/15 text-sm font-bold text-accent">
                      {pi + 1}
                    </span>
                    <h3 className="font-display text-lg font-bold text-gradient">
                      {phase.label}
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-faint">{phase.focus}</p>
                  <div className="mt-5 space-y-5">
                    {phase.items.map((item) => (
                      <div
                        key={item.dimensionId}
                        className="border-t border-border/50 pt-4 first:border-0 first:pt-0"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="size-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm font-semibold">
                            {item.dimensionName}
                          </span>
                          <span
                            className={cn(
                              "ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
                              PRIORITY_TAG[item.priority],
                            )}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5 text-xs">
                          <span className="text-faint">Meta:</span>
                          <span className="font-semibold" style={{ color: item.color }}>
                            {formatScore(item.score)} → {formatScore(item.target)}
                          </span>
                          <span className="text-faint">/ 10</span>
                        </div>
                        <ul className="mt-2.5 space-y-2 pl-5">
                          {item.actions.map((a, i) => (
                            <li
                              key={i}
                              className="list-disc text-sm leading-relaxed text-muted marker:text-faint"
                            >
                              {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Reveal>

      {/* AI advisor (conversational) */}
      <Reveal className="no-print">
        <AiAdvisor
          company={company}
          sector={sector}
          result={{
            overall: result.overall,
            levelName: result.level.name,
            dimensions: result.dimensions.map((d) => ({
              name: d.name,
              score: d.score,
            })),
          }}
        />
      </Reveal>

      {/* next steps */}
      <Reveal className="no-print">
        <div className="glass flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">¿Quieres avanzar con acompañamiento?</h2>
            <p className="text-sm text-muted">
              Descarga tu resultado o repite el diagnóstico cuando quieras.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className={buttonClasses("secondary", "md")}
            >
              <Download className="size-4" /> Descargar (PDF)
            </button>
            {onRestart && (
              <button
                type="button"
                onClick={onRestart}
                className={buttonClasses("ghost", "md")}
              >
                <RotateCcw className="size-4" /> Repetir
              </button>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
