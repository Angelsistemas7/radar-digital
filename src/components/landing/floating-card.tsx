"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/** Vaivén vertical suave, continuo. */
export function FloatingCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
}
