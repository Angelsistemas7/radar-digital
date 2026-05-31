import type { Answers, Respondent } from "./types";

const KEY = "radar-digital:v1";

export interface PersistedState {
  respondent?: Partial<Respondent>;
  answers?: Answers;
  sectionIndex?: number;
  updatedAt?: string;
}

/** Read in-progress assessment from localStorage (safe on server). */
export function loadState(): PersistedState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedState) : {};
  } catch {
    return {};
  }
}

/** Merge a partial patch into the persisted assessment. */
export function saveState(patch: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    const next = {
      ...loadState(),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore quota / serialization errors */
  }
}

export function clearState(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}
