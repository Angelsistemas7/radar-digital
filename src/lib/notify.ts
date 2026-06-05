/**
 * Lead notifications. When someone finishes the diagnosis and asks to be
 * contacted, the team gets an email with their details.
 *
 * Uses Resend (https://resend.com) over its REST API — no SDK, no SMTP server.
 * Fully optional: if RESEND_API_KEY / LEAD_NOTIFY_EMAIL aren't set, this is a
 * no-op, so the app keeps working without it.
 */

export interface LeadInfo {
  email: string;
  company?: string | null;
  full_name?: string | null;
  phone?: string | null;
  sector?: string | null;
  overall_score?: number | null;
}

function esc(s: unknown): string {
  return String(s ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function notifyLeadByEmail(lead: LeadInfo): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFY_EMAIL;
  if (!apiKey || !to) return;

  const from =
    process.env.LEAD_FROM_EMAIL || "Radar Digital <onboarding@resend.dev>";

  const row = (label: string, value: unknown) =>
    `<tr>
       <td style="padding:6px 14px;color:#64748b;font-size:13px;white-space:nowrap">${label}</td>
       <td style="padding:6px 14px;color:#0f172a;font-size:14px;font-weight:600">${esc(value)}</td>
     </tr>`;

  const score =
    lead.overall_score != null
      ? `${Number(lead.overall_score).toFixed(1).replace(".", ",")} / 10`
      : "—";

  const html = `
  <div style="font-family:Segoe UI,Arial,sans-serif;background:#f6f7f9;padding:24px">
    <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden">
      <div style="background:#0e7490;color:#fff;padding:18px 22px">
        <div style="font-size:13px;opacity:.85;letter-spacing:.04em;text-transform:uppercase">Radar Digital</div>
        <div style="font-size:19px;font-weight:700;margin-top:2px">Nuevo interesado en contacto</div>
      </div>
      <table style="width:100%;border-collapse:collapse;margin:8px 0">
        ${row("Empresa", lead.company)}
        ${row("Persona", lead.full_name)}
        ${row("Correo", lead.email)}
        ${row("Teléfono", lead.phone)}
        ${row("Sector", lead.sector)}
        ${row("Madurez", score)}
      </table>
      <div style="padding:14px 22px;border-top:1px solid #eef2f7;color:#94a3b8;font-size:12px">
        Esta persona completó el diagnóstico y pidió que el equipo la contacte.
      </div>
    </div>
  </div>`;

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
        subject: `Nuevo interesado: ${lead.company || lead.full_name || lead.email}`,
        html,
      }),
    });
  } catch {
    /* never block the user's flow on a mail hiccup */
  }
}
