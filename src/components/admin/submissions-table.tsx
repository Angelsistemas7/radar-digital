"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Search, Download, Inbox, X, Mail, Phone } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { QUESTIONNAIRE } from "@/lib/questionnaire";
import { formatScore } from "@/lib/utils";
import type { SubmissionRow } from "@/lib/submissions";

const LEVELS = QUESTIONNAIRE.maturityLevels;
const DIMS = QUESTIONNAIRE.dimensions;

function levelOf(id: number) {
  return LEVELS.find((l) => l.id === id);
}

function csvCell(value: unknown): string {
  const s = String(value ?? "");
  return /[",\r\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function buildCSV(rows: SubmissionRow[]): string {
  const headers = [
    "Fecha",
    "Empresa",
    "Nombre",
    "Cargo",
    "Género",
    "Correo",
    "Teléfono",
    "Ciudad",
    "País",
    "Sector",
    "Puntaje",
    "Nivel",
    "Quiere contacto",
    ...DIMS.map((d) => d.name),
  ];
  const lines = rows.map((r) => {
    const dimScores = DIMS.map(
      (d) => r.dimensions?.find((x) => x.dimensionId === d.id)?.score ?? "",
    );
    return [
      r.created_at,
      r.company,
      r.full_name,
      r.role,
      r.gender,
      r.email,
      r.phone,
      r.city,
      r.country,
      r.sector,
      r.overall_score,
      levelOf(r.level_id)?.name ?? r.level_id,
      r.wants_contact === true ? "Sí" : r.wants_contact === false ? "No" : "",
      ...dimScores,
    ];
  });
  return [headers, ...lines]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");
}

function downloadCSV(rows: SubmissionRow[]) {
  const csv = "﻿" + buildCSV(rows); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `radar-digital-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function SubmissionsTable({ rows }: { rows: SubmissionRow[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<number | "all">("all");
  const [sector, setSector] = useState<string>("all");
  const [onlyLeads, setOnlyLeads] = useState(false);
  const [detail, setDetail] = useState<SubmissionRow | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const sectors = useMemo(
    () =>
      Array.from(new Set(rows.map((r) => r.sector).filter(Boolean))).sort(
        (a, b) => a.localeCompare(b),
      ),
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (level !== "all" && r.level_id !== level) return false;
      if (sector !== "all" && r.sector !== sector) return false;
      if (onlyLeads && r.wants_contact !== true) return false;
      if (!q) return true;
      return [r.company, r.full_name, r.email, r.city, r.country, r.role, r.sector]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [rows, query, level, sector, onlyLeads]);

  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">
          Respuestas{" "}
          <span className="text-sm font-normal text-faint">({filtered.length})</span>
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar empresa, persona…"
              className="w-56 rounded-lg border border-border bg-surface/70 py-2 pl-9 pr-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={level}
            onChange={(e) =>
              setLevel(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm outline-none focus:border-primary/60"
          >
            <option value="all">Todos los niveles</option>
            {LEVELS.map((l) => (
              <option key={l.id} value={l.id} className="bg-surface">
                {l.name}
              </option>
            ))}
          </select>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="rounded-lg border border-border bg-surface/70 px-3 py-2 text-sm outline-none focus:border-primary/60"
          >
            <option value="all">Todos los sectores</option>
            {sectors.map((s) => (
              <option key={s} value={s} className="bg-surface">
                {s}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setOnlyLeads((v) => !v)}
            aria-pressed={onlyLeads}
            className={
              "rounded-lg border px-3 py-2 text-sm font-medium transition " +
              (onlyLeads
                ? "border-success/50 bg-success/10 text-success"
                : "border-border text-muted hover:text-foreground")
            }
          >
            Solo interesados
          </button>
          <button
            type="button"
            onClick={() => downloadCSV(filtered)}
            disabled={filtered.length === 0}
            className={buttonClasses("secondary", "sm")}
          >
            <Download className="size-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-12 text-center text-faint">
          <Inbox className="size-8" />
          <p>No hay respuestas para mostrar.</p>
        </div>
      ) : (
        <div className="-mx-2 overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-faint">
                <th className="px-3 py-2.5 font-medium">Fecha</th>
                <th className="px-3 py-2.5 font-medium">Empresa</th>
                <th className="px-3 py-2.5 font-medium">Responsable</th>
                <th className="px-3 py-2.5 font-medium">Ciudad / País</th>
                <th className="px-3 py-2.5 font-medium">Sector</th>
                <th className="px-3 py-2.5 font-medium">Correo</th>
                <th className="px-3 py-2.5 text-right font-medium">Puntaje</th>
                <th className="px-3 py-2.5 font-medium">Nivel</th>
                <th className="px-3 py-2.5 font-medium">Contacto</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const lvl = levelOf(r.level_id);
                return (
                  <tr
                    key={r.id}
                    onClick={() => setDetail(r)}
                    title="Ver detalle"
                    className="cursor-pointer border-t border-border/60 transition-colors hover:bg-elevated/40"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-faint">
                      {r.created_at?.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2.5 font-medium">{r.company}</td>
                    <td className="px-3 py-2.5 text-muted">
                      {r.full_name}
                      <span className="block text-xs text-faint">{r.role}</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted">
                      {r.city}
                      <span className="block text-xs text-faint">{r.country}</span>
                    </td>
                    <td className="px-3 py-2.5 text-muted">{r.sector}</td>
                    <td className="px-3 py-2.5 text-muted">{r.email}</td>
                    <td className="px-3 py-2.5 text-right font-semibold tabular-nums">
                      {formatScore(Number(r.overall_score))}
                    </td>
                    <td className="px-3 py-2.5">
                      <span
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${lvl?.color ?? "#5b6885"}1f`,
                          color: lvl?.color ?? "#93a0bd",
                        }}
                      >
                        {lvl?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      {r.wants_contact === true ? (
                        <span className="rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-medium text-success">
                          Sí
                        </span>
                      ) : (
                        <span className="text-xs text-faint">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setDetail(null)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="glass relative z-10 max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-3xl p-6"
          >
            {(() => {
              const lvl = levelOf(detail.level_id);
              return (
                <>
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-bold tracking-tight">
                        {detail.company}
                      </h3>
                      <p className="text-sm text-muted">
                        {detail.full_name} · {detail.role}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetail(null)}
                      className="rounded-lg p-1.5 text-muted transition hover:bg-elevated hover:text-foreground"
                      aria-label="Cerrar"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className="text-3xl font-bold tabular-nums"
                      style={{ color: lvl?.color }}
                    >
                      {formatScore(Number(detail.overall_score))}
                      <span className="text-base font-normal text-faint"> /10</span>
                    </span>
                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: `${lvl?.color ?? "#5b6885"}1f`,
                        color: lvl?.color ?? "#93a0bd",
                      }}
                    >
                      {lvl?.name ?? "—"}
                    </span>
                    {detail.wants_contact === true && (
                      <span className="rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success">
                        Quiere contacto
                      </span>
                    )}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <Field
                      label="Correo"
                      value={detail.email}
                      icon={<Mail className="size-3.5" />}
                    />
                    <Field
                      label="Teléfono"
                      value={detail.phone}
                      icon={<Phone className="size-3.5" />}
                    />
                    <Field label="Ciudad" value={detail.city} />
                    <Field label="País" value={detail.country} />
                    <Field label="Sector" value={detail.sector} />
                    <Field label="Género" value={detail.gender} />
                    <Field label="Nivel educativo" value={detail.education_level} />
                    <Field label="Fecha" value={detail.created_at?.slice(0, 10)} />
                  </div>

                  <h4 className="mt-5 mb-3 text-xs font-semibold uppercase tracking-wide text-faint">
                    Puntaje por dimensión
                  </h4>
                  <div className="space-y-2.5">
                    {DIMS.map((d) => {
                      const s =
                        detail.dimensions?.find((x) => x.dimensionId === d.id)
                          ?.score ?? 0;
                      return (
                        <div key={d.id}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted">{d.name}</span>
                            <span
                              className="font-semibold tabular-nums"
                              style={{ color: d.color }}
                            >
                              {formatScore(Number(s))}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-elevated">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(Number(s) / 10) * 100}%`,
                                backgroundColor: d.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  icon,
}: {
  label: string;
  value?: string | null;
  icon?: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="flex items-center gap-1 text-xs text-faint">
        {icon}
        {label}
      </p>
      <p className="truncate font-medium text-foreground/90">{value || "—"}</p>
    </div>
  );
}
