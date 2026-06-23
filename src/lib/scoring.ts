import { QUESTIONNAIRE } from "./questionnaire";
import type {
  Answers,
  AssessmentResult,
  DimensionScore,
  MaturityLevel,
  RecommendationBand,
} from "./types";
import { round1 } from "./utils";

/* Cortes únicos del semáforo (0-10). Fuente de verdad para colores y estados:
   rojo < 3 · amarillo 3–7,9 · verde ≥ 8. Respuestas 0/3/10: "más o menos" pesa
   poco (3), así que "todo más o menos" (promedio 3,0) queda en el PISO del amarillo;
   el rojo aparece cuando hay algún "no" arrastrando por debajo de 3 — sin trucar nada.
   Verde exige tener casi todo en "sí" (6 verdes + 2 amarillas = 8,25 → verde).
   Mantener alineado con questionnaire.ts → maturityLevels[].range. */
export const BAND_EDGES = { redMax: 3, amberMax: 8 } as const;

/** Índice de luz encendida del semáforo: 0 rojo · 1 amarillo · 2 verde. */
export function levelIndexForScore(score: number): 0 | 1 | 2 {
  if (score < BAND_EDGES.redMax) return 0;
  if (score < BAND_EDGES.amberMax) return 1;
  return 2;
}

/** Maturity level that contains a 0-10 score. */
export function levelForScore(score: number): MaturityLevel {
  return QUESTIONNAIRE.maturityLevels[levelIndexForScore(score)];
}

/** Coarse band used to pick tailored recommendations (PDF/correo).
 *  Alineada con los colores del semáforo (BAND_EDGES). */
export function bandForScore(score: number): RecommendationBand {
  if (score < BAND_EDGES.redMax) return "low";
  if (score < BAND_EDGES.amberMax) return "medium";
  return "high";
}

/** Average a single dimension's answered questions (0-10). */
export function scoreDimension(
  dimensionId: string,
  answers: Answers,
): DimensionScore {
  const dim = QUESTIONNAIRE.dimensions.find((d) => d.id === dimensionId)!;
  const values = dim.questions
    .map((q) => answers[q.id])
    .filter((v): v is number => typeof v === "number");
  const score = values.length
    ? round1(values.reduce((a, b) => a + b, 0) / values.length)
    : 0;
  return {
    dimensionId: dim.id,
    name: dim.name,
    color: dim.color,
    score,
    level: levelForScore(score).id,
    answered: values.length,
    total: dim.questions.length,
  };
}

/** Full result: per-dimension scores, overall, strengths and weaknesses. */
export function computeResult(answers: Answers): AssessmentResult {
  const dimensions = QUESTIONNAIRE.dimensions.map((d) =>
    scoreDimension(d.id, answers),
  );
  const overall = dimensions.length
    ? round1(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length)
    : 0;

  const byScoreDesc = [...dimensions].sort((a, b) => b.score - a.score);
  const strengths = byScoreDesc.filter((d) => d.score > 0).slice(0, 3);
  const weaknesses = [...byScoreDesc].reverse().slice(0, 3);

  return { overall, level: levelForScore(overall), dimensions, strengths, weaknesses };
}

export function totalQuestions(): number {
  return QUESTIONNAIRE.dimensions.reduce((n, d) => n + d.questions.length, 0);
}

export function answeredCount(answers: Answers): number {
  return QUESTIONNAIRE.dimensions.reduce(
    (n, d) => n + d.questions.filter((q) => typeof answers[q.id] === "number").length,
    0,
  );
}

/** True when every question has a numeric answer. */
export function isComplete(answers: Answers): boolean {
  return answeredCount(answers) === totalQuestions();
}
