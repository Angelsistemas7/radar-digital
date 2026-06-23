/**
 * Lead notifications. When someone finishes the diagnosis and asks to be
 * contacted, the team gets a rich email with their details, a radar chart of
 * their digital maturity and the suggested first-phase action plan.
 *
 * Uses Resend (https://resend.com) over its REST API — no SDK, no SMTP server.
 * Fully optional: if RESEND_API_KEY / LEAD_NOTIFY_EMAIL aren't set, this is a
 * no-op, so the app keeps working without it.
 */

import { QUESTIONNAIRE } from "./questionnaire";

export interface LeadDimension {
  name: string;
  score: number;
  color: string;
}

export interface LeadPlanItem {
  dimensionName: string;
  score: number;
  target: number;
  actions: string[];
}

export interface LeadEmailData {
  email: string;
  company?: string | null;
  full_name?: string | null;
  phone?: string | null;
  sector?: string | null;
  overall?: number | null;
  levelName?: string | null;
  dimensions?: LeadDimension[];
  plan?: { label: string; items: LeadPlanItem[] } | null;
}

function esc(s: unknown): string {
  return String(s ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function fmt(v: number | null | undefined): string {
  if (v == null) return "—";
  return Number.isInteger(v) ? String(v) : Number(v).toFixed(1).replace(".", ",");
}

/** Color for a maturity level by its name (falls back to brand teal). */
function levelColor(name?: string | null): string {
  return (
    QUESTIONNAIRE.maturityLevels.find((l) => l.name === name)?.color ?? "#0e7490"
  );
}

/** A radar chart rendered as a PNG by QuickChart (works in email clients). */
function radarUrl(dims: LeadDimension[]): string {
  const cfg = {
    type: "radar",
    data: {
      labels: dims.map((d) => d.name),
      datasets: [
        {
          data: dims.map((d) => d.score),
          backgroundColor: "rgba(14,116,144,0.22)",
          borderColor: "#0e7490",
          pointBackgroundColor: "#0e7490",
          pointRadius: 3,
          borderWidth: 2,
        },
      ],
    },
    options: {
      legend: { display: false },
      scale: {
        ticks: { beginAtZero: true, min: 0, max: 10, stepSize: 2, display: false },
        pointLabels: { fontSize: 12, fontColor: "#334155" },
        gridLines: { color: "#e2e8f0" },
        angleLines: { color: "#e2e8f0" },
      },
    },
  };
  return (
    "https://quickchart.io/chart?w=520&h=420&bkg=white&c=" +
    encodeURIComponent(JSON.stringify(cfg))
  );
}

function barsHtml(dims: LeadDimension[]): string {
  return dims
    .map(
      (d) => `
      <tr>
        <td style="padding:5px 8px;font-size:13px;color:#334155;white-space:nowrap">${esc(d.name)}</td>
        <td style="padding:5px 8px;width:100%">
          <div style="background:#eef2f7;border-radius:6px;height:9px">
            <div style="background:${d.color};height:9px;border-radius:6px;width:${Math.round((d.score / 10) * 100)}%"></div>
          </div>
        </td>
        <td style="padding:5px 8px;font-size:13px;font-weight:700;color:${d.color};text-align:right">${fmt(d.score)}</td>
      </tr>`,
    )
    .join("");
}

function planHtml(plan: LeadEmailData["plan"]): string {
  if (!plan || !plan.items?.length) return "";
  const items = plan.items
    .map(
      (it) => `
      <div style="border-left:3px solid #4f46e5;padding:8px 14px;margin:10px 0;background:#f8fafc;border-radius:0 8px 8px 0">
        <div style="font-size:14px;font-weight:700;color:#0f172a">
          ${esc(it.dimensionName)}
          <span style="color:#94a3b8;font-weight:400;font-size:13px">(${fmt(it.score)} &rarr; ${fmt(it.target)})</span>
        </div>
        <ul style="margin:6px 0 0;padding-left:18px;color:#475569;font-size:13px;line-height:1.5">
          ${it.actions.slice(0, 2).map((a) => `<li>${esc(a)}</li>`).join("")}
        </ul>
      </div>`,
    )
    .join("");
  return `
    <div style="padding:18px 24px 6px">
      <div style="font-size:15px;font-weight:700;color:#0f172a">Plan de acción sugerido · ${esc(plan.label)}</div>
    </div>
    <div style="padding:0 24px 10px">${items}</div>`;
}

export async function notifyLeadByEmail(lead: LeadEmailData): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const from =
    process.env.LEAD_FROM_EMAIL || "Semáforo Digital <onboarding@resend.dev>";

  const lc = levelColor(lead.levelName);
  const score = lead.overall != null ? fmt(lead.overall) : "—";
  const company = lead.company || lead.full_name || "Interesado";
  const firstName = (lead.full_name || "").trim().split(/\s+/)[0] || "la persona";
  const dims = lead.dimensions ?? [];

  const row = (label: string, value: unknown) =>
    `<tr>
       <td style="padding:7px 0;color:#64748b;font-size:13px;white-space:nowrap;width:90px;vertical-align:top">${label}</td>
       <td style="padding:7px 0;color:#0f172a;font-size:14px;font-weight:600">${esc(value)}</td>
     </tr>`;

  const radar = dims.length
    ? `<div style="text-align:center;padding:8px 0 4px">
         <img src="${radarUrl(dims)}" width="430" alt="Radar de madurez digital" style="max-width:100%;border-radius:12px" />
       </div>`
    : "";
  const bars = dims.length
    ? `<div style="padding:6px 24px 4px">
         <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:6px">Puntaje por dimensión</div>
         <table style="width:100%;border-collapse:collapse">${barsHtml(dims)}</table>
       </div>`
    : "";

  const preheader = `${esc(company)} · Nivel ${esc(lead.levelName)} · ${score}/10 — pidió que lo contacten.`;

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;background:#f6f7f9;padding:24px;color:#0f172a">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0">${preheader}</div>
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">

      <div style="background:#0b1224;padding:20px 24px">
        <div style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7c8cb0">Semáforo Digital</div>
        <div style="font-size:20px;font-weight:700;color:#fff;margin-top:3px">Nuevo interesado en contacto</div>
      </div>
      <div style="height:4px;background:${lc}"></div>

      <table style="width:100%;border-collapse:collapse;padding:0">
        <tr>
          <td style="padding:20px 24px 12px;vertical-align:top;width:128px">
            <div style="font-size:44px;font-weight:800;line-height:1;color:${lc}">${score}</div>
            <div style="font-size:12px;color:#94a3b8;margin-top:2px">de 10</div>
          </td>
          <td style="padding:20px 24px 12px 0;vertical-align:top">
            <span style="display:inline-block;background:${lc};color:#fff;font-size:12px;font-weight:700;padding:3px 10px;border-radius:999px">Nivel ${esc(lead.levelName)}</span>
            <div style="font-size:17px;font-weight:700;margin-top:8px">${esc(company)}</div>
            ${lead.full_name ? `<div style="font-size:13px;color:#64748b">${esc(lead.full_name)}</div>` : ""}
          </td>
        </tr>
      </table>

      <div style="padding:0 24px 4px">
        <table style="width:100%;border-collapse:collapse;border-top:1px solid #eef2f7">
          ${row("Correo", lead.email)}
          ${row("Teléfono", lead.phone)}
          ${row("Sector", lead.sector)}
        </table>
      </div>

      <div style="padding:14px 24px 6px">
        <a href="mailto:${esc(lead.email)}" style="display:inline-block;background:${lc};color:#fff;text-decoration:none;font-size:14px;font-weight:700;padding:10px 18px;border-radius:10px">Responder a ${esc(firstName)}</a>
      </div>

      ${radar}
      ${bars}
      ${planHtml(lead.plan)}

      <div style="padding:14px 24px;border-top:1px solid #eef2f7;color:#94a3b8;font-size:12px">
        Esta persona completó el diagnóstico y autorizó que el equipo la contacte.
        Datos tratados conforme a la Ley 1581 de 2012 (Habeas Data).
      </div>
    </div>
  </div>`;

  const text = [
    "Nuevo interesado en contacto — Semáforo Digital",
    "",
    `Empresa:  ${lead.company ?? "—"}`,
    `Persona:  ${lead.full_name ?? "—"}`,
    `Correo:   ${lead.email}`,
    `Teléfono: ${lead.phone ?? "—"}`,
    `Sector:   ${lead.sector ?? "—"}`,
    `Nivel:    ${lead.levelName ?? "—"} (${score}/10)`,
    "",
    "Completó el diagnóstico y pidió que el equipo lo contacte.",
  ].join("\n");

  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        reply_to: lead.email,
        subject: `Nuevo interesado · ${company} · Nivel ${lead.levelName ?? "—"} (${score}/10)`,
        html,
        text,
      }),
    });
  } catch {
    /* never block the user's flow on a mail hiccup */
  }
}
