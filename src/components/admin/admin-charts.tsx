"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import type { AdminSummary } from "@/lib/submissions";

const axisTick = { fill: "#93a0bd", fontSize: 12 };
const SECTOR_COLORS = [
  "#22d3ee", "#8b5cf6", "#34d399", "#fbbf24", "#f472b6",
  "#38bdf8", "#a78bfa", "#fb7185", "#4ade80", "#818cf8",
];
const tooltipStyle = {
  background: "#0f1626",
  border: "1px solid #2c3a5a",
  borderRadius: 12,
  color: "#e9eefb",
  fontSize: 13,
} as const;

export function LevelDistributionChart({
  data,
}: {
  data: AdminSummary["levelDistribution"];
}) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
        <XAxis dataKey="name" tick={axisTick} axisLine={{ stroke: "#1e2942" }} tickLine={false} />
        <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(v) => [`${v} empresas`, "Cantidad"]}
        />
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {data.map((d) => (
            <Cell key={d.levelId} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TimelineChart({ data }: { data: AdminSummary["timeline"] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
        <defs>
          <linearGradient id="tlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" vertical={false} />
        <XAxis
          dataKey="date"
          tick={axisTick}
          axisLine={{ stroke: "#1e2942" }}
          tickLine={false}
          tickFormatter={(d: string) => d.slice(5)}
          minTickGap={24}
        />
        <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}`, "Envíos"]} />
        <Area type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} fill="url(#tlGrad)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function CountryChart({ data }: { data: AdminSummary["byCountry"] }) {
  const top = data.slice(0, 8);
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, top.length * 34)}>
      <BarChart data={top} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 8 }}>
        <XAxis type="number" allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="country"
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          width={120}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(v) => [`${v} empresas`, "Cantidad"]}
        />
        <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function SectorChart({ data }: { data: AdminSummary["bySector"] }) {
  const top = data.slice(0, 10);
  return (
    <ResponsiveContainer width="100%" height={Math.max(180, top.length * 34)}>
      <BarChart data={top} layout="vertical" margin={{ top: 0, right: 24, bottom: 0, left: 8 }}>
        <XAxis
          type="number"
          domain={[0, 10]}
          tick={axisTick}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="sector"
          tick={axisTick}
          axisLine={false}
          tickLine={false}
          width={150}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
          formatter={(v) => [`${v}/10`, "Madurez promedio"]}
        />
        <Bar dataKey="avg" radius={[0, 6, 6, 0]} barSize={18}>
          {top.map((d, i) => (
            <Cell key={d.sector} fill={SECTOR_COLORS[i % SECTOR_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
