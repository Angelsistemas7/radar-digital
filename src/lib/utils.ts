import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely (conditional + conflict resolution). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Clamp a number between min and max. */
export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

/** Round to one decimal place. */
export function round1(value: number) {
  return Math.round(value * 10) / 10;
}

/** Format a 0-10 score for display (one decimal, comma as in es-CO). */
export function formatScore(value: number) {
  return round1(value).toLocaleString("es-CO", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

/* ---- Solid traffic-light color for a 0-10 score ---- */

/** Strong red / amber / green for a 0-10 score (no gradual tones).
 *  Los cortes (3 / 8) deben coincidir con BAND_EDGES en scoring.ts. */
export const TRAFFIC_COLORS = {
  red: "#ef4444",
  amber: "#f59e0b",
  green: "#22c55e",
} as const;

export function scoreColor(score: number): string {
  if (score < 3) return TRAFFIC_COLORS.red;
  if (score < 8) return TRAFFIC_COLORS.amber;
  return TRAFFIC_COLORS.green;
}
