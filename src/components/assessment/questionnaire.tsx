"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { DIMENSIONS, QUESTIONNAIRE } from "@/lib/questionnaire";
import { answeredCount, totalQuestions } from "@/lib/scoring";
import { TrafficLight } from "./traffic-light";
import { DimensionIcon } from "@/components/ui/dimension-icon";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Answers } from "@/lib/types";

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
  const isLast = sectionIndex === DIMENSIONS.length - 1;
  const sectionComplete = dim.questions.every(
    (q) => typeof answers[q.id] === "number",
  );

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
        requestAnimationFrame(() =>
          document.getElementById(`q-${next.id}`)?.scrollIntoView({
            behavior: reduce ? "auto" : "smooth",
            block: "center",
          }),
        );
      }
    } else {
      const complete = dim.questions.every(
        (q) => q.id === qid || typeof answers[q.id] === "number",
      );
      if (complete && !isLast) window.setTimeout(() => go(1), 550);
    }
  };

  return (
    <div ref={topRef} className="scroll-mt-24">
      {/* progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">
            Sección{" "}
            <span className="font-semibold text-foreground">
              {sectionIndex + 1}
            </span>{" "}
            de {DIMENSIONS.length}
          </span>
          <span className="text-muted">
            {done}/{total} respondidas
          </span>
        </div>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-elevated">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
            animate={{ width: `${(done / total) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {DIMENSIONS.map((d, i) => {
            const complete = d.questions.every(
              (q) => typeof answers[q.id] === "number",
            );
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => navigate(i, i > sectionIndex ? 1 : -1)}
                aria-label={d.title}
                className={cn(
                  "h-1.5 min-w-6 flex-1 rounded-full transition-colors",
                  i === sectionIndex
                    ? "bg-primary"
                    : complete
                      ? "bg-success/60"
                      : "bg-elevated hover:bg-border-strong",
                )}
              />
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={sectionIndex}
          initial={{ opacity: 0, x: dir * 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: dir * -40 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="glass rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-start gap-4">
            <div
              className="flex size-12 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${dim.color}1f`, color: dim.color }}
            >
              <DimensionIcon name={dim.icon} className="size-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">{dim.title}</h2>
              <p className="mt-1 text-sm text-muted">{dim.description}</p>
            </div>
          </div>

          {/* how to answer */}
          <p className="mt-5 rounded-xl bg-elevated/60 px-3.5 py-2.5 text-xs text-muted">
            En cada pregunta, enciende la luz del semáforo que corresponda.
          </p>

          <div className="mt-6 space-y-7">
            {dim.questions.map((q, qi) => (
              <div
                key={q.id}
                id={`q-${q.id}`}
                className="scroll-mt-24 border-t border-border/60 pt-6 first:border-0 first:pt-0"
              >
                <p className="mb-4 flex gap-2 text-[15px] font-medium text-foreground/95">
                  <span className="text-faint">{qi + 1}.</span>
                  <span>{q.text}</span>
                </p>
                <TrafficLight
                  value={answers[q.id]}
                  onChange={(v) => handleAnswer(q.id, qi, v)}
                  options={QUESTIONNAIRE.responseOptions}
                />
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-3">
        <button type="button" onClick={() => go(-1)} className={buttonClasses("ghost", "md")}>
          <ArrowLeft className="size-4" />
          {sectionIndex === 0 ? "Datos" : "Anterior"}
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
              Siguiente <ArrowRight className="size-4" />
            </>
          )}
        </button>
      </div>
      {!sectionComplete && (
        <p className="mt-2 text-right text-xs text-faint">
          Responde las {dim.questions.length} preguntas para continuar.
        </p>
      )}
    </div>
  );
}
