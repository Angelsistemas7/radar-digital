"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check, ShieldCheck } from "lucide-react";
import { DIMENSIONS, QUESTIONNAIRE } from "@/lib/questionnaire";
import { answeredCount, totalQuestions } from "@/lib/scoring";
import { TrafficLight } from "./traffic-light";
import { DimensionIcon } from "@/components/ui/dimension-icon";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Answers } from "@/lib/types";

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Desplazamiento suave y controlado (más lento/gentil que el scroll nativo). */
function animatedScrollTo(el: HTMLElement, duration: number) {
  const startY = window.scrollY;
  const rect = el.getBoundingClientRect();
  const targetY = startY + rect.top - (window.innerHeight - rect.height) / 2;
  const dist = targetY - startY;
  if (Math.abs(dist) < 2) return;
  let startTs: number | null = null;
  const ease = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic
  const step = (ts: number) => {
    if (startTs === null) startTs = ts;
    const p = Math.min((ts - startTs) / duration, 1);
    window.scrollTo(0, startY + dist * ease(p));
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function Questionnaire({
  sectionIndex,
  onSectionChange,
  answers,
  onAnswer,
  onFinish,
  onExit,
}: {
  sectionIndex: number;
  onSectionChange: (i: number) => void;
  answers: Answers;
  onAnswer: (qid: string, value: number) => void;
  onFinish: () => void;
  onExit: () => void;
}) {
  const [dir, setDir] = useState(1);
  const topRef = useRef<HTMLDivElement>(null);

  const dim = DIMENSIONS[sectionIndex];
  const total = totalQuestions();
  const done = answeredCount(answers);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const isLast = sectionIndex === DIMENSIONS.length - 1;
  const sectionComplete = dim.questions.every(
    (q) => typeof answers[q.id] === "number",
  );
  const remaining = dim.questions.filter(
    (q) => typeof answers[q.id] !== "number",
  ).length;

  const navigate = (target: number, direction: number) => {
    setDir(direction);
    onSectionChange(target);
    requestAnimationFrame(() =>
      topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const go = (delta: number) => {
    const next = sectionIndex + delta;
    if (next < 0) return onExit();
    if (next >= DIMENSIONS.length) return onFinish();
    navigate(next, delta);
  };

  const reduce = useReducedMotion();

  // Save the answer, then gently move forward: scroll to the next unanswered
  // question, or auto-advance to the next section once this one is complete.
  const handleAnswer = (qid: string, qi: number, value: number) => {
    onAnswer(qid, value);
    const next = dim.questions[qi + 1];
    if (next) {
      if (typeof answers[next.id] !== "number") {
        requestAnimationFrame(() => {
          const el = document.getElementById(`q-${next.id}`);
          if (!el) return;
          if (reduce) el.scrollIntoView({ block: "center" });
          else animatedScrollTo(el, 900); // un poco más lento, más suave
        });
      }
    } else {
      const complete = dim.questions.every(
        (q) => q.id === qid || typeof answers[q.id] === "number",
      );
      if (complete && !isLast) window.setTimeout(() => go(1), 700);
    }
  };

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* progress */}
      <div className="mb-7">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-faint">
              Diagnóstico de madurez
            </p>
            <p className="mt-1 truncate text-sm text-muted">
              Dimensión{" "}
              <span className="font-semibold text-foreground">
                {sectionIndex + 1}
              </span>{" "}
              de {DIMENSIONS.length} ·{" "}
              <span className="text-foreground/80">{dim.name}</span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-2xl font-bold leading-none tabular-nums">
              {pct}
              <span className="text-base text-faint">%</span>
            </p>
            <p className="mt-1 text-xs text-faint tabular-nums">
              {done}/{total} respondidas
            </p>
          </div>
        </div>

        {/* per-dimension progress segments */}
        <div className="mt-3 flex items-center gap-1">
          {DIMENSIONS.map((d, i) => {
            const ans = d.questions.filter(
              (q) => typeof answers[q.id] === "number",
            ).length;
            const frac = ans / d.questions.length;
            const current = i === sectionIndex;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => navigate(i, i > sectionIndex ? 1 : -1)}
                aria-label={`${d.title} · ${ans} de ${d.questions.length}`}
                className={cn(
                  "relative flex-1 overflow-hidden rounded-full bg-elevated transition-all",
                  current ? "h-2" : "h-1.5",
                )}
              >
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-primary"
                  animate={{ width: `${frac * 100}%`, opacity: current ? 1 : 0.6 }}
                  transition={{ type: "spring", stiffness: 140, damping: 22 }}
                />
                {current && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full"
                    style={{ boxShadow: "inset 0 0 0 1.5px var(--color-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={sectionIndex}
          initial={{ opacity: 0, x: dir * 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -24 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass overflow-hidden rounded-3xl"
        >
          {/* dimension header with a color accent */}
          <div
            className="relative px-6 pt-6 sm:px-8 sm:pt-8"
            style={{
              background: `linear-gradient(180deg, ${dim.color}14, transparent)`,
            }}
          >
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-0.5"
              style={{ backgroundColor: dim.color }}
            />
            <div className="flex items-center gap-4">
              <div
                className="flex size-14 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${dim.color}1f`, color: dim.color }}
              >
                <DimensionIcon name={dim.icon} className="size-7" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-faint">
                  <span className="font-display tabular-nums" style={{ color: dim.color }}>
                    {pad2(sectionIndex + 1)}
                  </span>
                  <span className="h-3 w-px bg-border" />
                  <span>de {pad2(DIMENSIONS.length)}</span>
                </div>
                <h2 className="mt-0.5 font-display text-2xl font-bold tracking-tight">
                  {dim.title}
                </h2>
              </div>
            </div>
            <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted">
              {dim.description}
            </p>
            <p className="mt-4 text-xs text-faint">
              Sé honesto: aquí no hay respuestas buenas ni malas, solo tu punto de
              partida.
            </p>
          </div>

          {/* questions */}
          <div className="space-y-1 px-6 pb-6 pt-4 sm:px-8 sm:pb-8">
            {dim.questions.map((q, qi) => {
              const answered = typeof answers[q.id] === "number";
              const tone =
                answered
                  ? ({ 0: "#ef4444", 5: "#f59e0b", 10: "#22c55e" } as Record<number, string>)[
                      answers[q.id] as number
                    ]
                  : undefined;
              return (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  className="scroll-mt-24 rounded-2xl border-t border-border/60 px-3 py-6 transition-[background-color,box-shadow] duration-500 first:border-0 first:pt-2 sm:px-4"
                  style={
                    tone
                      ? { backgroundColor: `${tone}0d`, boxShadow: `inset 4px 0 0 0 ${tone}` }
                      : undefined
                  }
                >
                  <div className="mb-4 flex gap-3">
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors",
                        !answered && "text-faint ring-1 ring-inset ring-border",
                      )}
                      style={
                        answered
                          ? { backgroundColor: `${dim.color}1f`, color: dim.color }
                          : undefined
                      }
                    >
                      {answered ? <Check className="size-3.5" /> : qi + 1}
                    </span>
                    <p className="text-[15px] font-medium leading-relaxed text-foreground/95">
                      {q.text}
                    </p>
                  </div>
                  <div className="pl-9">
                    <TrafficLight
                      value={answers[q.id]}
                      onChange={(v) => handleAnswer(q.id, qi, v)}
                      options={QUESTIONNAIRE.responseOptions}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          className={buttonClasses("ghost", "md")}
        >
          <ArrowLeft className="size-4" />
          {sectionIndex === 0 ? "Datos" : DIMENSIONS[sectionIndex - 1].name}
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={!sectionComplete}
          className={buttonClasses("primary", "md")}
        >
          {isLast ? (
            <>
              Ver resultados <Check className="size-4" />
            </>
          ) : (
            <>
              {DIMENSIONS[sectionIndex + 1].name} <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-faint">
        <span className="inline-flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" />
          Tu progreso se guarda solo.
        </span>
        {!sectionComplete && (
          <span>
            Faltan {remaining} {remaining === 1 ? "pregunta" : "preguntas"} en esta
            sección.
          </span>
        )}
      </div>
    </div>
  );
}
