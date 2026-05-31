import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";

/* ============================================================
   Radar Digital — AI advisor (multi-provider)
   Grounded in our framework (8 dimensions, maturity levels,
   consulting method) via a system prompt. Auto-detects the API key:
     - Claude (Anthropic)        — best quality, paid
     - Gemini (Google AI Studio) — FREE tier, native SDK (acepta keys "AQ.")
     - Groq (Llama)              — FREE, very fast (OpenAI-compatible)
     - OpenRouter                — :free models (OpenAI-compatible)
   ============================================================ */

const SYSTEM = `Eres un consultor senior en transformación digital que acompaña a emprendimientos y pymes (contexto: Ruta Emprende, Universidad Externado de Colombia). Hablas español claro, cercano y profesional.

Evalúas la madurez digital en 8 dimensiones, cada una en escala 0 a 10:
1. Estrategia Digital — visión, liderazgo y hoja de ruta de la transformación.
2. Cultura y Talento Digital — competencias, capacitación y cultura de innovación.
3. Experiencia del Cliente — canales digitales, escucha y personalización.
4. Procesos y Operaciones — digitalización, automatización e integración.
5. Tecnología e Infraestructura — infraestructura, nube y escalabilidad.
6. Datos y Analítica — captura, calidad y uso de datos para decidir.
7. Innovación y Modelo de Negocio — nuevos productos/ingresos digitales y agilidad.
8. Ciberseguridad y Protección de Datos — protección de la información, Habeas Data y respaldos.

Niveles de madurez (sobre 10): Incipiente (0–2), Básico (2–4), En desarrollo (4–6), Avanzado (6–8), Líder Digital (8–10).

Tu tarea cuando recibas los resultados de una empresa:
- Interpreta sus puntajes con empatía y precisión: qué significan para el negocio y qué riesgos u oportunidades implican.
- Señala con claridad sus 2–3 debilidades más críticas y por qué importan.
- Reconoce y apalanca sus fortalezas.
- Propón un plan de acción accionable y detallado por fases (0–3, 3–6 y 6–12 meses). Para cada acción indica, cuando aporte: qué hacer, una herramienta o ejemplo concreto, y el resultado esperado. Prioriza lo urgente y de mayor impacto. Acciones realistas para una pyme o emprendimiento, no genéricas.

Reglas:
- Responde SIEMPRE en español.
- Sé concreto y con buen nivel de detalle. Usa markdown: encabezados cortos (##), listas y **negritas**. Evita el relleno.
- Personaliza con el nombre y los puntajes de la empresa.
- No inventes datos que no te dieron. Si preguntan algo ajeno al diagnóstico, redirige amablemente.
- Al final, invita a seguir la conversación con preguntas de seguimiento.`;

interface ProviderConfig {
  kind: "anthropic" | "gemini" | "openai";
  apiKey: string;
  baseURL?: string;
  model: string;
  label: string;
}

/** Pick a provider based on which API key is configured (Claude first). */
function detectProvider(): ProviderConfig | null {
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      kind: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || "claude-opus-4-8",
      label: "Claude",
    };
  }
  const googleKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (googleKey) {
    return {
      kind: "gemini",
      apiKey: googleKey,
      model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
      label: "Gemini",
    };
  }
  if (process.env.GROQ_API_KEY) {
    return {
      kind: "openai",
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      label: "Groq",
    };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return {
      kind: "openai",
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.3-70b-instruct:free",
      label: "OpenRouter",
    };
  }
  return null;
}

export function isAdvisorConfigured(): boolean {
  return detectProvider() !== null;
}

export function advisorLabel(): string {
  return detectProvider()?.label ?? "";
}

export interface AdvisorResult {
  company?: string;
  sector?: string;
  overall: number;
  levelName: string;
  dimensions: { name: string; score: number }[];
}

export interface AdvisorMessage {
  role: "user" | "assistant";
  content: string;
}

function buildContext(result: AdvisorResult, history: AdvisorMessage[]): string {
  const dims = [...result.dimensions]
    .sort((a, b) => a.score - b.score)
    .map((d) => `- ${d.name}: ${d.score.toFixed(1)}/10`)
    .join("\n");

  return (
    `Empresa: ${result.company?.trim() || "(sin nombre)"}` +
    (result.sector ? ` · Sector: ${result.sector}` : "") +
    `\nPuntaje global: ${result.overall.toFixed(1)}/10 — Nivel ${result.levelName}.\n` +
    `Puntajes por dimensión (de menor a mayor):\n${dims}\n\n` +
    (history.length === 0
      ? "Genera el diagnóstico y el plan de acción detallado para esta empresa."
      : "Usa estos resultados como contexto para responder la conversación.")
  );
}

const MAX_TOKENS = 4000;

/** Provider-agnostic text stream of the advisor's answer. */
export async function* streamAdvisorText(
  result: AdvisorResult,
  history: AdvisorMessage[],
): AsyncGenerator<string> {
  const cfg = detectProvider();
  if (!cfg) return;

  const context = buildContext(result, history);

  if (cfg.kind === "anthropic") {
    const client = new Anthropic({ apiKey: cfg.apiKey });
    const stream = client.messages.stream({
      model: cfg.model,
      max_tokens: MAX_TOKENS,
      thinking: { type: "adaptive" },
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      messages: [{ role: "user", content: context }, ...history],
    });
    for await (const event of stream) {
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        yield event.delta.text;
      }
    }
    return;
  }

  if (cfg.kind === "gemini") {
    // Native Google GenAI SDK — works with AI Studio keys (incl. "AQ." format).
    const ai = new GoogleGenAI({ apiKey: cfg.apiKey });
    const contents = [
      { role: "user", parts: [{ text: context }] },
      ...history.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    ];
    const stream = await ai.models.generateContentStream({
      model: cfg.model,
      contents,
      config: { systemInstruction: SYSTEM, maxOutputTokens: MAX_TOKENS },
    });
    for await (const chunk of stream) {
      const text = chunk.text;
      if (text) yield text;
    }
    return;
  }

  // OpenAI-compatible (Groq / OpenRouter)
  const client = new OpenAI({ apiKey: cfg.apiKey, baseURL: cfg.baseURL });
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM },
    { role: "user", content: context },
    ...history.map((m) => ({ role: m.role, content: m.content })),
  ];
  const stream = await client.chat.completions.create({
    model: cfg.model,
    max_tokens: MAX_TOKENS,
    stream: true,
    messages,
  });
  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) yield delta;
  }
}
