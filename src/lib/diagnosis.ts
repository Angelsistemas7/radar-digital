import { QUESTIONNAIRE } from "./questionnaire";
import { bandForScore } from "./scoring";
import type {
  ActionItem,
  ActionPhase,
  AssessmentResult,
  Diagnosis,
  DimensionScore,
  Respondent,
} from "./types";
import { formatScore } from "./utils";

function dimById(id: string) {
  return QUESTIONNAIRE.dimensions.find((d) => d.id === id)!;
}

function toActionItem(ds: DimensionScore): ActionItem {
  const dim = dimById(ds.dimensionId);
  const band = bandForScore(ds.score);
  const priority = band === "low" ? "alta" : band === "medium" ? "media" : "baja";
  return {
    dimensionId: ds.dimensionId,
    dimensionName: ds.name,
    color: ds.color,
    priority,
    actions: dim.recommendations[band],
  };
}

/**
 * Rule-based diagnosis + phased action plan.
 * The return shape is intentionally stable so a generative-AI
 * implementation can replace this later without touching the UI.
 */
export function generateDiagnosis(
  result: AssessmentResult,
  respondent?: Pick<Respondent, "company">,
): Diagnosis {
  const company = respondent?.company?.trim();
  const subject = company && company.length > 1 ? company : "tu empresa";

  const strongest = result.strengths[0];
  const weakest = result.weaknesses[0];

  const headline = `${subject} se encuentra en un nivel ${result.level.name} de madurez digital.`;

  const summary =
    `Con un puntaje global de ${formatScore(result.overall)}/10, ${subject} destaca en ` +
    `${strongest?.name ?? "—"} (${formatScore(strongest?.score ?? 0)}) y tiene su mayor ` +
    `oportunidad de mejora en ${weakest?.name ?? "—"} (${formatScore(weakest?.score ?? 0)}). ` +
    result.level.description;

  const perDimension = [...result.dimensions]
    .sort((a, b) => a.score - b.score)
    .map((ds) => {
      const dim = dimById(ds.dimensionId);
      const band = bandForScore(ds.score);
      return {
        dimensionId: ds.dimensionId,
        name: ds.name,
        color: ds.color,
        score: ds.score,
        band,
        recommendations: dim.recommendations[band],
      };
    });

  // Phased plan: weakest dimensions first.
  const ascending = [...result.dimensions].sort((a, b) => a.score - b.score);
  const n = ascending.length;
  const cut1 = Math.ceil(n / 3);
  const cut2 = Math.ceil((2 * n) / 3);

  const plan: ActionPhase[] = [
    {
      id: "fase-1",
      label: "0–3 meses",
      focus: "Cerrar brechas críticas y lograr victorias rápidas",
      items: ascending.slice(0, cut1).map(toActionItem),
    },
    {
      id: "fase-2",
      label: "3–6 meses",
      focus: "Consolidar capacidades y conectar las áreas",
      items: ascending.slice(cut1, cut2).map(toActionItem),
    },
    {
      id: "fase-3",
      label: "6–12 meses",
      focus: "Escalar, optimizar y diferenciarse en el mercado",
      items: ascending.slice(cut2).map(toActionItem),
    },
  ];

  return { headline, summary, perDimension, plan };
}
