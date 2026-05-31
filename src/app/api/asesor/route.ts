import { type NextRequest } from "next/server";
import {
  isAdvisorConfigured,
  streamAdvisor,
  type AdvisorMessage,
  type AdvisorResult,
} from "@/lib/ai/advisor";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isAdvisorConfigured()) {
    return Response.json(
      { error: "El asesor con IA aún no está configurado." },
      { status: 503 },
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limited = rateLimit(`asesor:${ip}`, 12, 60_000);
  if (!limited.ok) {
    return Response.json(
      { error: "Demasiadas solicitudes. Espera un momento." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const data = body as {
    result?: AdvisorResult;
    messages?: AdvisorMessage[];
  };
  const result = data.result;
  if (
    !result ||
    typeof result.overall !== "number" ||
    !Array.isArray(result.dimensions)
  ) {
    return Response.json(
      { error: "Datos del resultado inválidos" },
      { status: 422 },
    );
  }

  const history: AdvisorMessage[] = (Array.isArray(data.messages) ? data.messages : [])
    .filter(
      (m) =>
        m &&
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string",
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

  try {
    const stream = streamAdvisor(result, history);
    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });
    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json(
      { error: "No se pudo generar el diagnóstico con IA." },
      { status: 500 },
    );
  }
}
