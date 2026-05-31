"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface RadarDatum {
  label: string;
  value: number; // 0..max
  color?: string;
}

/**
 * Custom animated SVG radar. The data polygon grows in from the
 * chart's center. Adapts to any number of axes (5, 8, N).
 */
export function RadarChart({
  data,
  max = 10,
  size = 360,
  showLabels = true,
  className,
  animate = true,
}: {
  data: RadarDatum[];
  max?: number;
  size?: number;
  showLabels?: boolean;
  className?: string;
  animate?: boolean;
}) {
  const gid = useId().replace(/:/g, "");
  const n = Math.max(data.length, 3);
  const cx = size / 2;
  const cy = size / 2;
  const pad = showLabels ? 66 : 16;
  const r = size / 2 - pad;

  const angleFor = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pointFor = (i: number, value: number): [number, number] => {
    const rad = (Math.min(Math.max(value, 0), max) / max) * r;
    const a = angleFor(i);
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const dataPoints = data.map((d, i) => pointFor(i, d.value));
  const dataPolygon = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className={cn("h-auto w-full overflow-visible", className)}
      role="img"
      aria-label="Radar de madurez digital"
    >
      <defs>
        <radialGradient id={`fill-${gid}`} cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.18" />
        </radialGradient>
      </defs>

      {/* concentric grid rings */}
      {rings.map((ring, ri) => (
        <polygon
          key={ri}
          points={data.map((_, i) => pointFor(i, ring * max).join(",")).join(" ")}
          fill={ri === rings.length - 1 ? "rgba(255,255,255,0.015)" : "none"}
          stroke="#2c3a5a"
          strokeOpacity={0.55}
          strokeWidth={1}
        />
      ))}

      {/* axes + labels */}
      {data.map((d, i) => {
        const [ex, ey] = pointFor(i, max);
        const a = angleFor(i);
        const lx = cx + (r + 20) * Math.cos(a);
        const ly = cy + (r + 20) * Math.sin(a);
        const anchor =
          Math.cos(a) > 0.3 ? "start" : Math.cos(a) < -0.3 ? "end" : "middle";
        return (
          <g key={d.label}>
            <line
              x1={cx}
              y1={cy}
              x2={ex}
              y2={ey}
              stroke="#2c3a5a"
              strokeOpacity={0.5}
              strokeWidth={1}
            />
            {showLabels && (
              <text
                x={lx}
                y={ly}
                textAnchor={anchor}
                dominantBaseline="middle"
                className="fill-muted"
                style={{ fontSize: 12.5, fontWeight: 600 }}
              >
                {d.label}
              </text>
            )}
          </g>
        );
      })}

      {/* data shape — scales in from the chart center */}
      <motion.g
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={animate ? { scale: 0, opacity: 0 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 55, damping: 14, delay: 0.15 }}
      >
        {/* transparent full-size rect anchors the transform origin to center */}
        <rect x={0} y={0} width={size} height={size} fill="transparent" />
        <polygon
          points={dataPolygon}
          fill={`url(#fill-${gid})`}
          stroke="#22d3ee"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p[0]}
            cy={p[1]}
            r={4.5}
            fill={data[i].color ?? "#22d3ee"}
            stroke="#070a12"
            strokeWidth={1.5}
          />
        ))}
      </motion.g>
    </svg>
  );
}
