import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { notifyLeadByEmail } from "@/lib/notify";
import { computeResult } from "@/lib/scoring";
import { generateDiagnosis } from "@/lib/diagnosis";
import { rateLimit } from "@/lib/rate-limit";
import type { Answers } from "@/lib/types";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().max(160),
  wantsContact: z.boolean(),
});

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  return xff?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`contacto:${ip}`, 10, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiadas solicitudes. Intenta de nuevo en un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 422 });
  }

  const { email, wantsContact } = parsed.data;

  // Best-effort: attach the preference to the most recent submission for
  // this email. Never block the user's confirmation on a DB hiccup.
  const supabase = getSupabaseAdmin();
  let lead: Record<string, unknown> = {};
  if (supabase) {
    try {
      const { data } = await supabase
        .from("submissions")
        .select("id, company, full_name, phone, sector, overall_score, answers")
        .eq("email", email.toLowerCase())
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.id) {
        lead = data;
        await supabase
          .from("submissions")
          .update({ wants_contact: wantsContact })
          .eq("id", data.id as string);
      }
    } catch {
      /* column may not exist yet, or transient error — ignore */
    }
  }

  // Notify the team about a new interested lead. Point LEAD_WEBHOOK_URL (or the
  // shared N8N_WEBHOOK_URL) at an n8n/Make/Zapier flow to forward it to email,
  // Google Sheets or a CRM — no extra code needed. Fire-and-forget.
  const hook = process.env.LEAD_WEBHOOK_URL || process.env.N8N_WEBHOOK_URL;
  if (wantsContact && hook) {
    void fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "lead",
        email: email.toLowerCase(),
        wantsContact,
        ...lead,
        created_at: new Date().toISOString(),
      }),
    }).catch(() => {
      /* ignore webhook failures */
    });
  }

  // Email the team directly (Resend). No-op unless RESEND_API_KEY is set.
  // We recompute the result from the stored answers to include the radar
  // chart and the suggested first-phase action plan in the email.
  if (wantsContact) {
    let dimensions: { name: string; score: number; color: string }[] | undefined;
    let overall = lead.overall_score as number | undefined;
    let levelName: string | undefined;
    let plan: { label: string; items: import("@/lib/notify").LeadPlanItem[] } | null =
      null;
    try {
      const answers = (lead.answers ?? {}) as Answers;
      if (answers && Object.keys(answers).length) {
        const result = computeResult(answers);
        const diag = generateDiagnosis(result, {
          company: (lead.company as string) ?? "",
        });
        dimensions = result.dimensions.map((d) => ({
          name: d.name,
          score: d.score,
          color: d.color,
        }));
        overall = result.overall;
        levelName = result.level.name;
        const phase1 = diag.plan[0];
        if (phase1) {
          plan = {
            label: phase1.label,
            items: phase1.items.map((it) => ({
              dimensionName: it.dimensionName,
              score: it.score,
              target: it.target,
              actions: it.actions,
            })),
          };
        }
      }
    } catch {
      /* fall back to the basic email if recomputation fails */
    }

    void notifyLeadByEmail({
      email: email.toLowerCase(),
      company: lead.company as string | undefined,
      full_name: lead.full_name as string | undefined,
      phone: lead.phone as string | undefined,
      sector: lead.sector as string | undefined,
      overall,
      levelName,
      dimensions,
      plan,
    });
  }

  return NextResponse.json({ ok: true });
}
