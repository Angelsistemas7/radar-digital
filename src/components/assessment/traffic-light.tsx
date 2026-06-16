"use client";

import { motion } from "motion/react";
import { Check, Minus, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ResponseOption } from "@/lib/types";

/** Visual config per light. */
const TONES: Record<ResponseOption["tone"], { hex: string; Icon: LucideIcon }> = {
  red: { hex: "#ef4444", Icon: X },
  amber: { hex: "#f59e0b", Icon: Minus },
  green: { hex: "#22c55e", Icon: Check },
};

/** "#ef4444" + alpha -> "rgba(239,68,68,a)" (motion-safe, no hex8). */
function rgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

/**
 * A real-looking vertical traffic light: dark casing with three round lenses
 * (rojo arriba, amarillo en medio, verde abajo). The chosen lens lights up and
 * glows; the rest stay dim, like a real semáforo. Each option carries a 0-10
 * value (rojo = 0, amarillo = 5, verde = 10) so scoring stays unchanged.
 */
export function TrafficLight({
  value,
  onChange,
  options,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  options: ResponseOption[];
}) {
  const idx = options.findIndex((o) => o.value === value);

  // Arrow keys move the selection up/down the light.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      onChange(options[Math.min((idx < 0 ? -1 : idx) + 1, options.length - 1)].value);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      onChange(options[Math.max((idx < 0 ? options.length : idx) - 1, 0)].value);
    }
  };

  return (
    <div className="flex items-center gap-4 sm:gap-5">
      {/* casing — red on top, amber middle, green bottom */}
      <div
        role="radiogroup"
        aria-label="Responde con el semáforo"
        onKeyDown={onKeyDown}
        className="flex shrink-0 flex-col gap-2.5 rounded-[20px] p-2.5"
        style={{
          background: "linear-gradient(160deg, #2b3543 0%, #0a0e14 100%)",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -10px 18px rgba(0,0,0,0.5), 0 16px 32px -18px rgba(0,0,0,0.85)",
        }}
      >
        {options.map((opt) => {
          const { hex, Icon } = TONES[opt.tone];
          const selected = typeof value === "number" && value === opt.value;
          return (
            <motion.button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${opt.label} — ${opt.hint}`}
              onClick={() => onChange(opt.value)}
              whileTap={{ scale: 0.92 }}
              className={cn(
                "relative grid size-12 place-items-center rounded-full outline-none transition-[background-color,box-shadow] duration-300 sm:size-14",
                "focus-visible:ring-2 focus-visible:ring-white/60",
              )}
              style={
                selected
                  ? {
                      backgroundColor: hex,
                      boxShadow: `0 0 22px 4px ${rgba(hex, 0.8)}, 0 0 0 3px ${rgba(hex, 0.28)}, inset 0 3px 5px rgba(255,255,255,0.45), inset 0 -3px 6px rgba(0,0,0,0.25)`,
                    }
                  : {
                      backgroundColor: rgba(hex, 0.16),
                      boxShadow: `inset 0 0 0 1px ${rgba(hex, 0.4)}, inset 0 2px 8px rgba(0,0,0,0.6)`,
                    }
              }
            >
              {/* glossy highlight on a lit lens */}
              {selected && (
                <span
                  aria-hidden
                  className="absolute left-2.5 top-2 size-3 rounded-full bg-white/55 blur-[2px]"
                />
              )}
              <Icon
                aria-hidden
                strokeWidth={3}
                className={cn(
                  "relative size-5 transition-colors duration-300 sm:size-6",
                  selected ? "text-white" : "text-white/25",
                )}
              />
            </motion.button>
          );
        })}
      </div>

      {/* meaning of each light, aligned to the lens it describes */}
      <div className="flex flex-1 flex-col gap-2.5 py-2.5">
        {options.map((opt) => {
          const { hex } = TONES[opt.tone];
          const selected = typeof value === "number" && value === opt.value;
          return (
            <button
              key={opt.id}
              type="button"
              tabIndex={-1}
              aria-hidden
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex h-12 items-center rounded-xl border border-transparent px-3 text-left transition-all sm:h-14",
                !selected && "hover:bg-elevated/60",
              )}
              style={
                selected
                  ? {
                      backgroundColor: rgba(hex, 0.12),
                      boxShadow: `inset 0 0 0 1px ${rgba(hex, 0.45)}`,
                    }
                  : undefined
              }
            >
              <span className="flex flex-col leading-tight">
                <span
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    !selected && "text-foreground/90",
                  )}
                  style={selected ? { color: hex } : undefined}
                >
                  {opt.label}
                </span>
                <span className="text-[11px] text-muted">{opt.hint}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
