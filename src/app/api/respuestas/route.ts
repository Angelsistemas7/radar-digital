import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { respondentSchema } from "@/lib/validation";
import { saveSubmission } from "@/lib/submissions";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const answersSchema = z
  .record(z.string(), z.number().min(0).max(10))
  .refine(
    (a) => Object.keys(a).length >= 8 && Object.keys(a).length <= 200,
    "Conjunto de respuestas inválido",
  );

const payloadSchema = z.object({
  respondent: respondentSchema,
  answers: answersSchema,
  // A `result` may be sent by the client but is ignored — we recompute it.
});

function clientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  return (
    xff?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "radar-digital";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const limited = rateLimit(`respuestas:${ip}`, 5, 60_000);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Demasiados envíos. Intenta de nuevo en un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Cuerpo JSON inválido" }, { status: 400 });
  }

  const parsed = payloadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: z.treeifyError(parsed.error) },
      { status: 422 },
    );
  }

  try {
    const { stored, result } = await saveSubmission(
      parsed.data.respondent,
      parsed.data.answers,
      { userAgent: req.headers.get("user-agent"), ipHash: hashIp(ip) },
    );
    return NextResponse.json({
      ok: true,
      stored,
      overall: result.overall,
      levelId: result.level.id,
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar el diagnóstico." },
      { status: 500 },
    );
  }
}
