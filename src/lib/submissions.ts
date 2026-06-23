import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase/server";
import { computeResult, levelForScore } from "./scoring";
import { QUESTIONNAIRE } from "./questionnaire";
import { round1 } from "./utils";
import type { Answers, Respondent } from "./types";
import { SECTORS } from "./validation";
import { appendToSheet } from "./sheets";

/** A row as stored in / read from the `submissions` table. */
export interface SubmissionRow {
  id: string;
  created_at: string;
  company: string;
  full_name: string;
  role: string;
  gender: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  sector: string;
  overall_score: number;
  level_id: number;
  dimensions: { dimensionId: string; score: number }[];
  answers: Answers;
  wants_contact?: boolean | null;
  user_agent?: string | null;
  ip_hash?: string | null;
}

export interface SaveMeta {
  userAgent?: string | null;
  ipHash?: string | null;
}

/** Recompute the result server-side (never trust the client) and persist. */
export async function saveSubmission(
  respondent: Respondent,
  answers: Answers,
  meta: SaveMeta = {},
) {
  const result = computeResult(answers);
  const row = {
    company: respondent.company,
    full_name: respondent.fullName,
    role: respondent.role,
    gender: respondent.gender,
    email: respondent.email.toLowerCase(),
    phone: respondent.phone,
    city: respondent.city,
    country: respondent.country,
    sector: respondent.sector,
    overall_score: result.overall,
    level_id: result.level.id,
    dimensions: result.dimensions.map((d) => ({
      dimensionId: d.dimensionId,
      score: d.score,
    })),
    answers,
    user_agent: meta.userAgent ?? null,
    ip_hash: meta.ipHash ?? null,
  };

  // Google Sheets — fire and forget.
  void appendToSheet({
    respondent,
    overall: result.overall,
    levelName: result.level.name,
    dimensions: result.dimensions.map((d) => ({ name: d.name, score: d.score })),
  }).catch(() => {});

  // Outbound webhook (n8n / Make / Zapier) — fire and forget.
  // Lets you push each submission to Google Sheets/Drive, email or a CRM
  // without writing extra code. Works even without Supabase.
  const hook = process.env.N8N_WEBHOOK_URL;
  if (hook) {
    void fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...row,
        level: result.level.name,
        created_at: new Date().toISOString(),
      }),
    }).catch(() => {
      /* ignore webhook failures */
    });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { stored: false as const, result };

  const { data, error } = await supabase
    .from("submissions")
    .insert(row)
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  return { stored: true as const, id: data.id as string, result };
}

/** True when running without a database (admin shows sample data). */
export function isDemoMode(): boolean {
  return !isSupabaseConfigured();
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Stable, realistic sample submissions for local exploration / demos. */
function demoRows(): SubmissionRow[] {
  const rnd = mulberry32(20260530);
  const pick = <T,>(arr: readonly T[]) => arr[Math.floor(rnd() * arr.length)];
  const companies = [
    "Innova Café", "TechSur", "AgroVerde", "ModaViva", "LogiExpress",
    "EduFuturo", "SaludYa", "ConstruPlus", "FinanzApp", "Verde Market",
    "DataNova", "Artesanal Co.", "Viajes Andinos", "BioClean", "RoboTech",
    "Dulce Hogar",
  ];
  const roles = ["Fundador/a", "Gerente", "Director/a", "CEO", "Coordinador/a"];
  const genders = ["Hombre", "Mujer", "No binario", "Prefiero no responder"];
  const sectors = SECTORS;
  const places: [string, string][] = [
    ["Bogotá", "Colombia"], ["Medellín", "Colombia"], ["Cali", "Colombia"],
    ["Barranquilla", "Colombia"], ["Cartagena", "Colombia"], ["Bucaramanga", "Colombia"],
    ["Ciudad de México", "México"], ["Lima", "Perú"], ["Santiago", "Chile"],
    ["Buenos Aires", "Argentina"], ["Quito", "Ecuador"],
  ];
  const firstNames = ["María", "Juan", "Camila", "Andrés", "Valentina", "Santiago", "Daniela", "Carlos", "Laura", "Felipe"];
  const lastNames = ["Gómez", "Rodríguez", "Martínez", "López", "Ramírez", "Torres", "Díaz", "Vargas", "Rojas", "Moreno"];
  const dims = QUESTIONNAIRE.dimensions;

  const rows: SubmissionRow[] = [];
  for (let i = 0; i < 16; i++) {
    const company = pick(companies) + (rnd() > 0.7 ? " S.A.S." : "");
    const [city, country] = pick(places);
    const base = 2 + rnd() * 6;
    const dimensions = dims.map((d) => ({
      dimensionId: d.id,
      score: round1(Math.max(0, Math.min(10, base + (rnd() - 0.5) * 5))),
    }));
    const overall = round1(
      dimensions.reduce((a, x) => a + x.score, 0) / dimensions.length,
    );
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const slug = company.toLowerCase().replace(/[^a-z]/g, "").slice(0, 10);
    rows.push({
      id: `demo-${i}`,
      created_at: new Date(
        Date.now() - Math.floor(rnd() * 34) * 86_400_000 - Math.floor(rnd() * 86_400_000),
      ).toISOString(),
      company,
      full_name: `${fn} ${ln}`,
      role: pick(roles),
      gender: pick(genders),
      email: `${fn}.${ln}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "") + `@${slug || "empresa"}.com`,
      phone: "+57 3" + String(Math.floor(rnd() * 1e8)).padStart(8, "0"),
      city,
      country,
      sector: pick(sectors),
      overall_score: overall,
      level_id: levelForScore(overall).id,
      dimensions,
      answers: {},
      wants_contact: rnd() > 0.6,
    });
  }
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function listSubmissions(): Promise<SubmissionRow[]> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return demoRows();
  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(2000);
  if (error) throw new Error(error.message);
  return (data ?? []) as SubmissionRow[];
}

/* ---------- aggregates for the admin dashboard ---------- */

export interface AdminSummary {
  total: number;
  leads: number;
  avgOverall: number;
  topLevel: { name: string; color: string } | null;
  levelDistribution: { levelId: number; name: string; color: string; count: number }[];
  dimensionAverages: { dimensionId: string; name: string; color: string; avg: number }[];
  bySector: { sector: string; count: number; avg: number }[];
  byCountry: { country: string; count: number }[];
  timeline: { date: string; count: number }[];
}

export function summarize(rows: SubmissionRow[]): AdminSummary {
  const total = rows.length;
  const leads = rows.filter((r) => r.wants_contact === true).length;
  const avgOverall = total
    ? round1(rows.reduce((a, r) => a + Number(r.overall_score), 0) / total)
    : 0;

  const levelDistribution = QUESTIONNAIRE.maturityLevels.map((l) => ({
    levelId: l.id,
    name: l.name,
    color: l.color,
    count: rows.filter((r) => r.level_id === l.id).length,
  }));

  const dimensionAverages = QUESTIONNAIRE.dimensions.map((d) => {
    const vals = rows.map(
      (r) => r.dimensions?.find((x) => x.dimensionId === d.id)?.score ?? 0,
    );
    const avg = vals.length ? round1(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
    return { dimensionId: d.id, name: d.name, color: d.color, avg };
  });

  const sectorMap = new Map<string, { count: number; sum: number }>();
  rows.forEach((r) => {
    const key = r.sector || "Sin sector";
    const cur = sectorMap.get(key) ?? { count: 0, sum: 0 };
    cur.count += 1;
    cur.sum += Number(r.overall_score);
    sectorMap.set(key, cur);
  });
  const bySector = [...sectorMap.entries()]
    .map(([sector, v]) => ({ sector, count: v.count, avg: round1(v.sum / v.count) }))
    .sort((a, b) => b.count - a.count);

  const countryMap = new Map<string, number>();
  rows.forEach((r) => countryMap.set(r.country, (countryMap.get(r.country) ?? 0) + 1));
  const byCountry = [...countryMap.entries()]
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count);

  const dayMap = new Map<string, number>();
  rows.forEach((r) => {
    const day = (r.created_at ?? "").slice(0, 10);
    if (day) dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  });
  const timeline = [...dayMap.entries()]
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const best = [...levelDistribution].sort((a, b) => b.count - a.count)[0];
  const topLevel = best && best.count > 0 ? { name: best.name, color: best.color } : null;

  return {
    total,
    leads,
    avgOverall,
    topLevel,
    levelDistribution,
    dimensionAverages,
    bySector,
    byCountry,
    timeline,
  };
}
