"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { OnboardingForm } from "./onboarding-form";
import { Questionnaire } from "./questionnaire";
import { ResultView } from "@/components/results/result-view";
import { computeResult, isComplete } from "@/lib/scoring";
import { loadState, saveState, clearState } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { Answers } from "@/lib/types";
import type { RespondentInput } from "@/lib/validation";

type Phase = "intro" | "questions" | "results";

export function AssessmentFlow() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [respondent, setRespondent] = useState<RespondentInput | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [sectionIndex, setSectionIndex] = useState(0);
  const submitted = useRef(false);

  // Restore in-progress assessment from localStorage after mount.
  useEffect(() => {
    const s = loadState();
    if (s.answers) setAnswers(s.answers);
    if (s.respondent) setRespondent(s.respondent as RespondentInput);
    if (typeof s.sectionIndex === "number") setSectionIndex(s.sectionIndex);
    if (s.respondent && s.answers && isComplete(s.answers)) setPhase("results");
    else if (s.respondent) setPhase("questions");
    setMounted(true);
  }, []);

  const handleAnswer = (qid: string, value: number) => {
    setAnswers((prev) => {
      const next = { ...prev, [qid]: value };
      saveState({ answers: next });
      return next;
    });
  };

  const submitOnce = (data: RespondentInput, finalAnswers: Answers) => {
    if (submitted.current) return;
    submitted.current = true;
    const result = computeResult(finalAnswers);
    const payload = {
      respondent: data,
      answers: finalAnswers,
      result: {
        overall: result.overall,
        levelId: result.level.id,
        dimensions: result.dimensions.map((d) => ({
          dimensionId: d.dimensionId,
          score: d.score,
        })),
      },
    };
    // Fire-and-forget; results still show if the backend isn't configured yet.
    fetch("/api/respuestas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {
      submitted.current = false;
    });
  };

  const handleFinish = () => {
    if (respondent) submitOnce(respondent, answers);
    setPhase("results");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRestart = () => {
    clearState();
    submitted.current = false;
    setAnswers({});
    setRespondent(null);
    setSectionIndex(0);
    setPhase("intro");
    window.scrollTo({ top: 0 });
  };

  if (!mounted) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center text-faint">
        Cargando…
      </div>
    );
  }

  const result = phase === "results" ? computeResult(answers) : null;
  const wide = phase === "results";

  return (
    <div className={cn("mx-auto px-5 py-10 sm:py-14", wide ? "max-w-5xl" : "max-w-3xl")}>
      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <OnboardingForm
              initial={respondent ?? undefined}
              onComplete={(data) => {
                setRespondent(data);
                setSectionIndex(0);
                saveState({ respondent: data, sectionIndex: 0 });
                setPhase("questions");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </motion.div>
        )}

        {phase === "questions" && (
          <motion.div
            key="questions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Questionnaire
              sectionIndex={sectionIndex}
              onSectionChange={(i) => {
                setSectionIndex(i);
                saveState({ sectionIndex: i });
              }}
              answers={answers}
              onAnswer={handleAnswer}
              onFinish={handleFinish}
              onExit={() => {
                setPhase("intro");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </motion.div>
        )}

        {phase === "results" && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            <ResultView
              result={result}
              company={respondent?.company}
              sector={respondent?.sector}
              onRestart={handleRestart}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
