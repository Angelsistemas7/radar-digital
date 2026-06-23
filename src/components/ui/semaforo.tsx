"use client";

import { motion } from "motion/react";
import { scoreColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

const LAMP_COLORS = ["#ef4444", "#f59e0b", "#22c55e"] as const;

/**
 * Semáforo animado de 3 luces. La lámpara activa se enciende según el score:
 * < 6.1 → rojo (0), < 9.1 → ámbar (1), ≥ 9.1 → verde (2).
 */
export function Semaforo({
  score,
  size = "lg",
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const active = score < 6.1 ? 0 : score < 9.1 ? 1 : 2;
  const on = scoreColor(score);

  const dims = {
    sm: { wrapper: "w-[72px] rounded-[1.4rem] p-3 gap-2.5", lamp: "size-[38px]", highlight: { cx: 1.8, cy: 1.8, r: 1.2 } },
    md: { wrapper: "w-[96px] rounded-[1.8rem] p-4 gap-3", lamp: "size-[54px]", highlight: { cx: 1.8, cy: 1.8, r: 1.5 } },
    lg: { wrapper: "w-[124px] rounded-[2.2rem] p-5 gap-4", lamp: "size-[70px]", highlight: { cx: 2.2, cy: 2.2, r: 1.9 } },
  }[size];

  return (
    <div
      className={cn(
        "relative mx-auto flex shrink-0 flex-col items-center border border-white/10 bg-[#0b1220]/85 shadow-xl",
        dims.wrapper,
        className,
      )}
    >
      {LAMP_COLORS.map((c, i) => {
        const lit = i === active;
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 + i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={cn("rounded-full", dims.lamp)}
            style={
              lit
                ? {
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), ${on} 58%)`,
                    boxShadow: `0 0 34px 5px ${on}, inset 0 2px 8px rgba(255,255,255,0.35)`,
                  }
                : { backgroundColor: c, opacity: 0.13 }
            }
          />
        );
      })}
    </div>
  );
}
