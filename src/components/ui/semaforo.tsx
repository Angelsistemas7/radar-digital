"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { levelIndexForScore } from "@/lib/scoring";
import { cn } from "@/lib/utils";

/** Solid lamp colors — rojo, ámbar, verde (no gradual). */
export const LAMP_COLORS = ["#ef4444", "#f59e0b", "#22c55e"] as const;
/** Soft ambient tints per light. El ámbar resalta mucho en blanco, así que se le
 *  baja y se sube rojo/verde para que las tres luces se noten por igual. */
export const WASH = [
  "rgba(239,68,68,0.26)", // rojo — más presente
  "rgba(245,158,11,0.13)", // ámbar — ya destaca, va más bajo
  "rgba(22,163,74,0.28)", // verde — más oscuro y presente
] as const;
export type LampIndex = 0 | 1 | 2;

type Size = "xs" | "sm" | "md" | "lg" | "xl";

const DIMS: Record<
  Size,
  { wrapper: string; lamp: string; gap: string; glow: number }
> = {
  xs: { wrapper: "w-[48px] rounded-[1rem] p-2", lamp: "size-[26px]", gap: "gap-1.5", glow: 14 },
  sm: { wrapper: "w-[68px] rounded-[1.3rem] p-2.5", lamp: "size-[36px]", gap: "gap-2.5", glow: 22 },
  md: { wrapper: "w-[92px] rounded-[1.7rem] p-3.5", lamp: "size-[52px]", gap: "gap-3", glow: 30 },
  lg: { wrapper: "w-[120px] rounded-[2.1rem] p-5", lamp: "size-[68px]", gap: "gap-4", glow: 38 },
  xl: { wrapper: "w-[150px] rounded-[2.6rem] p-6", lamp: "size-[88px]", gap: "gap-5", glow: 50 },
};

/** A single lamp — lit lamps get a 3D glassy look + glow; off lamps stay dim. */
function Lamp({
  color,
  lit,
  className,
  glow,
  index,
  pulse,
}: {
  color: string;
  lit: boolean;
  className?: string;
  glow: number;
  index: number;
  pulse?: boolean;
}) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.1 + index * 0.08, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn("relative rounded-full", className)}
      style={
        lit
          ? {
              background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.5) 12%, ${color} 52%, ${color} 70%, rgba(0,0,0,0.35) 100%)`,
              boxShadow: `0 0 ${glow}px ${Math.round(glow / 6)}px ${color}, 0 0 ${Math.round(glow * 1.8)}px ${Math.round(glow / 4)}px ${color}66, inset 0 2px 6px rgba(255,255,255,0.55), inset 0 -4px 10px rgba(0,0,0,0.35)`,
            }
          : {
              background: "radial-gradient(circle at 36% 30%, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 60%, rgba(0,0,0,0.45) 100%)",
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.65), inset 0 -1px 2px rgba(255,255,255,0.04)",
            }
      }
    >
      {/* breathing glow halo on the active lamp */}
      {lit && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 ${glow}px ${Math.round(glow / 5)}px ${color}` }}
          animate={{ opacity: [0.55, 1, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {/* pulse overlay — expande el color hacia afuera sin oscurecer la lámpara */}
      {lit && pulse && (
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at center, ${color} 0%, transparent 75%)`,
          }}
          animate={{ opacity: [0, 0.45, 0] }}
          transition={{ duration: 2.0, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.3 }}
        />
      )}
      {/* specular highlight */}
      {lit && (
        <span
          aria-hidden
          className="absolute left-[22%] top-[16%] h-[26%] w-[34%] rounded-full bg-white/70 blur-[2px]"
        />
      )}
    </motion.span>
  );
}

/**
 * Semáforo de 3 luces con aspecto 3D. Recibe `score` (deriva la luz por bandas)
 * o `active`/`color` explícitos (para el modo animado del home).
 */
export function Semaforo({
  score,
  active,
  color,
  size = "lg",
  pulse = false,
  className,
}: {
  score?: number;
  active?: LampIndex;
  color?: string;
  size?: Size;
  pulse?: boolean;
  className?: string;
}) {
  const lit = active ?? (typeof score === "number" ? levelIndexForScore(score) : 1);
  const dims = DIMS[size];

  return (
    <div
      className={cn(
        "relative mx-auto flex shrink-0 flex-col items-center",
        dims.wrapper,
        dims.gap,
        className,
      )}
      style={{
        background: "linear-gradient(155deg, #38445a 0%, #1a2334 38%, #0a0e16 100%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow:
          "inset 0 2px 0 rgba(255,255,255,0.14), inset 0 -16px 28px rgba(0,0,0,0.55), 0 26px 50px -22px rgba(0,0,0,0.7), 0 8px 18px -10px rgba(0,0,0,0.5)",
      }}
    >
      {/* soft top sheen for the 3D casing */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-2 top-1.5 h-1/3 rounded-full"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.16), transparent)" }}
      />
      {LAMP_COLORS.map((c, i) => (
        <Lamp
          key={i}
          index={i}
          color={color && i === lit ? color : c}
          lit={i === lit}
          className={dims.lamp}
          glow={dims.glow}
          pulse={pulse}
        />
      ))}
    </div>
  );
}

/** Cicla 0→1→2→0 con un intervalo. Respeta prefers-reduced-motion. */
export function useSemaforoCycle(intervalMs = 2200): { index: LampIndex; color: string } {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState<LampIndex>(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(
      () => setIndex((p) => ((p + 1) % 3) as LampIndex),
      intervalMs,
    );
    return () => window.clearInterval(id);
  }, [reduce, intervalMs]);

  return { index, color: LAMP_COLORS[index] };
}

/** Semáforo que cambia de color solo (rojo→amarillo→verde). */
export function SemaforoCycle({
  size = "lg",
  intervalMs,
  className,
}: {
  size?: Size;
  intervalMs?: number;
  className?: string;
}) {
  const { index, color } = useSemaforoCycle(intervalMs);
  return <Semaforo active={index} color={color} size={size} className={className} />;
}

/**
 * Wrapper de sección con dos blobs difuminados que siguen el color del semáforo.
 * Úsalo en secciones del home para que el color del hero "sangre" hacia abajo.
 */
export function AmbientSection({
  children,
  className,
  strength = 1,
}: {
  children: ReactNode;
  className?: string;
  /** 0–1: opacidad de los blobs. Úsalo para calibrar la intensidad por sección. */
  strength?: number;
}) {
  const { index } = useSemaforoCycle(2200);
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <motion.div
        aria-hidden
        className="pointer-events-none absolute right-[2%] top-0 size-[38rem] rounded-full blur-[80px]"
        style={{ opacity: strength }}
        animate={{ backgroundColor: WASH[index] }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[2%] size-[38rem] rounded-full blur-[80px]"
        style={{ opacity: strength }}
        animate={{ backgroundColor: WASH[index] }}
        transition={{ duration: 1.6, ease: "easeInOut" }}
      />
      {children}
    </div>
  );
}

/** Fondo ambiental con dos blobs que se tiñen del color del semáforo. */
export function AmbientWash({
  intervalMs = 2600,
  className,
}: {
  intervalMs?: number;
  className?: string;
}) {
  const { index } = useSemaforoCycle(intervalMs);
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <motion.div
        className="absolute -top-24 right-[-12%] size-[26rem] rounded-full blur-3xl"
        animate={{ backgroundColor: WASH[index] }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-28 left-[-12%] size-[26rem] rounded-full blur-3xl"
        animate={{ backgroundColor: WASH[index] }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
      />
    </div>
  );
}
