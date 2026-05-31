import { type NextRequest } from "next/server";
import {
  isAdvisorConfigured,
  streamAdvisorText,
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

  const gen = streamAdvisorText(result, history);

  // Pull the first chunk eagerly so provider errors (bad key, model, etc.)
  // return a clean JSON error instead of a broken stream.
  let first: IteratorResult<string>;
  try {
    first = await gen.next();
  } catch (err) {
    console.error("Asesor IA error:", err);
    return Response.json(
      {
        error:
          "El proveedor de IA rechazó la solicitud. Revisa la API key o el modelo.",
      },
      { status: 502 },
    );
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        if (!first.done && first.value) {
          controller.enqueue(encoder.encode(first.value));
        }
        for await (const text of gen) {
          controller.enqueue(encoder.encode(text));
        }
        controller.close();
      } catch (err) {
        console.error("Asesor IA stream error:", err);
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
}
