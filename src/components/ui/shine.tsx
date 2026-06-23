"use client";
import { motion } from "motion/react";

/** Sweep de brillo de izquierda a derecha. El padre necesita relative + overflow-hidden. */
export function ShineOverlay({ delay = 4 }: { delay?: number }) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute inset-0 -skew-x-12"
      style={{
        background:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.22) 50%, transparent 100%)",
      }}
      initial={{ x: "-150%" }}
      animate={{ x: "150%" }}
      transition={{ duration: 0.65, repeat: Infinity, repeatDelay: delay, ease: "easeInOut" }}
    />
  );
}
