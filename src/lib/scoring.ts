import { QUESTIONNAIRE } from "./questionnaire";
import type {
  Answers,
  AssessmentResult,
  DimensionScore,
  MaturityLevel,
  RecommendationBand,
} from "./types";
import { round1 } from "./utils";

/** Maturity level that contains a 0-10 score. */
export function levelForScore(score: number): MaturityLevel {
  const levels = QUESTIONNAIRE.maturityLevels;
  return (
    levels.find((l) => score >= l.range[0] && score < l.range[1]) ??
    levels[levels.length - 1]
  );
}

/** Coarse band used to pick tailored recommendations.
 *  Aligned with the traffic-light color bands (rojo <6.1, amarillo <9.1, verde). */
export function bandForScore(score: number): RecommendationBand {
  if (score < 6.1) return "low";
  if (score < 9.1) return "medium";
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
