"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Makes all Motion animations respect the user's reduced-motion preference. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
