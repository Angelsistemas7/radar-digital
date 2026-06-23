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

/* ---- Gradual traffic-light color for a 0-10 score ---- */

const COLOR_STOPS: [number, string][] = [
  [0, "#ef4444"], // rojo
  [6, "#f59e0b"], // amarillo
  [9, "#22c55e"], // verde
  [10, "#16a34a"], // verde intenso
];

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function lerpHex(a: string, b: string, t: number): string {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  const ch = (i: number) =>
    Math.round(A[i] + (B[i] - A[i]) * t)
      .toString(16)
      .padStart(2, "0");
  return `#${ch(0)}${ch(1)}${ch(2)}`;
}

/** Smooth red → amber → green color for a 0-10 score (gradual tonality). */
export function scoreColor(score: number): string {
  const s = clamp(score, 0, 10);
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    const [x1, c1] = COLOR_STOPS[i - 1];
    const [x2, c2] = COLOR_STOPS[i];
    if (s <= x2) {
      const t = x2 === x1 ? 0 : (s - x1) / (x2 - x1);
      return lerpHex(c1, c2, t);
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1][1];
}
