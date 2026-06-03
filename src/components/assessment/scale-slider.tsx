"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import type { ScaleAnchor } from "@/lib/types";

function colorFor(v: number): string {
  if (v <= 2) return "#dc2626";
  if (v <= 4) return "#ea580c";
  if (v <= 6) return "#d97706";
  if (v <= 8) return "#16a34a";
  return "#0e7490";
}

/** 0-10 slider with a dynamic color that reflects the chosen value. */
export function ScaleSlider({
  value,
  onChange,
  max = 10,
  anchors,
}: {
  value: number | undefined;
  onChange: (v: number) => void;
  max?: number;
  anchors?: ScaleAnchor[];
}) {
  const id = useId();
  const answered = typeof value === "number";
  const current = answered ? value : 0;
  const pct = (current / max) * 100;
  const color = colorFor(current);

  return (
    <div>
      <div className="flex items-center gap-4">
        <div
          className="group relative h-2.5 flex-1 rounded-full bg-elevated focus-within:ring-2 focus-within:ring-primary/30"
          style={{ borderRadius: 999 }}
        >
          {/* filled portion */}
          <div
            className={cn(
              "absolute inset-y-0 left-0 rounded-full transition-all duration-150",
              !answered && "opacity-40",
            )}
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, #dc2626, ${color})`,
            }}
          />
          {/* thumb */}
          <div
            className={cn(
              "pointer-events-none absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background shadow-lg transition-all duration-150",
              !answered && "opacity-60",
            )}
            style={{ left: `${pct}%`, backgroundColor: answered ? color : "#5b6885" }}
          />
          <input
            id={id}
            type="range"
            min={0}
            max={max}
            step={0.1}
            value={current}
            onChange={(e) =>
              onChange(Math.round(Number(e.target.value) * 10) / 10)
            }
            aria-label="Calificación de 0 a 10"
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </div>

        {/* value badge */}
        <div
          className="flex h-11 w-16 shrink-0 items-center justify-center rounded-xl border text-lg font-bold tabular-nums transition-colors"
          style={{
            color: answered ? color : "#5b6885",
            borderColor: answered ? `${color}55` : "#e5e7eb",
            backgroundColor: answered ? `${color}14` : "transparent",
          }}
        >
          {answered ? value.toFixed(1) : "–"}
        </div>
      </div>

      {anchors && anchors.length > 0 && (
        <div className="mt-2 flex justify-between text-[11px] text-faint">
          {anchors.map((a) => (
            <span key={a.value}>{a.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}
