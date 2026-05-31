/* ============================================================
   Radar Digital — Domain types
   The whole assessment is data-driven: change the questionnaire
   config and the radar adapts automatically (5, 8, N axes).
   ============================================================ */

export type RecommendationBand = "low" | "medium" | "high";

export interface ScaleAnchor {
  value: number;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  help?: string;
}

export interface Dimension {
  /** URL-safe slug, also used as score key. */
  id: string;
  /** Short label for the radar axis. */
  name: string;
  /** Full title for cards and headings. */
  title: string;
  /** Lucide icon name (mapped in components/ui/dimension-icon). */
  icon: string;
  /** Accent color (hex) for charts and badges. */
  color: string;
  description: string;
  questions: Question[];
  /** Tailored recommendations by score band. */
  recommendations: Record<RecommendationBand, string[]>;
}

export type MaturityLevelId = 1 | 2 | 3 | 4 | 5;

export interface MaturityLevel {
  id: MaturityLevelId;
  name: string;
  /** [min inclusive, max exclusive] on a 0-10 scale. */
  range: [number, number];
  tagline: string;
  description: string;
  color: string;
}

export interface Questionnaire {
  id: string;
  version: string;
  title: string;
  scale: { min: number; max: number; step: number; anchors: ScaleAnchor[] };
  dimensions: Dimension[];
  maturityLevels: MaturityLevel[];
}

/** Respondent answers: questionId -> score (0-10). */
export type Answers = Record<string, number>;

export interface DimensionScore {
  dimensionId: string;
  name: string;
  color: string;
  score: number; // 0-10
  level: MaturityLevelId;
  answered: number;
  total: number;
}

export interface AssessmentResult {
  overall: number; // 0-10
  level: MaturityLevel;
  dimensions: DimensionScore[];
  strengths: DimensionScore[];
  weaknesses: DimensionScore[];
}

/** Identity captured before the test (de-duplicates submissions). */
export interface Respondent {
  company: string;
  fullName: string;
  role: string;
  gender: string;
  phone: string;
  email: string;
  city: string;
  country: string;
  sector: string;
  consent: boolean;
}

/* ---- Rule-based diagnosis + action plan ---- */

export interface ActionItem {
  dimensionId: string;
  dimensionName: string;
  color: string;
  priority: "alta" | "media" | "baja";
  actions: string[];
}

export interface ActionPhase {
  id: string;
  label: string; // "0–3 meses"
  focus: string;
  items: ActionItem[];
}

export interface Diagnosis {
  headline: string;
  summary: string;
  perDimension: {
    dimensionId: string;
    name: string;
    color: string;
    score: number;
    band: RecommendationBand;
    recommendations: string[];
  }[];
  plan: ActionPhase[];
}

/** A full submission as stored in the database. */
export interface Submission {
  id?: string;
  createdAt?: string;
  respondent: Respondent;
  answers: Answers;
  result: {
    overall: number;
    levelId: MaturityLevelId;
    dimensions: { dimensionId: string; score: number }[];
  };
}
