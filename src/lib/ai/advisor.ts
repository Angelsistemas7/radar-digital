import Anthropic from "@anthropic-ai/sdk";

/* ============================================================
   Radar Digital — AI advisor (Claude)
   "Specialized" not by fine-tuning but by grounding Claude in our
   framework (the 8 dimensions, maturity levels, consulting method)
   via a cached system prompt. Streams the answer back.
   ============================================================ */

const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

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
- Interpreta sus puntajes con empatía y precisión: qué significan para el negocio.
- Señala con claridad sus 2–3 debilidades más críticas y por qué importan.
- Reconoce y apalanca sus fortalezas.
- Propón un plan de acción accionable por fases (0–3, 3–6 y 6–12 meses), priorizando lo urgente y de mayor impacto. Acciones concretas y realistas para una pyme o emprendimiento, no genéricas.

Reglas:
- Responde SIEMPRE en español.
- Sé concreto y conciso. Usa markdown: encabezados cortos (##), listas y **negritas**. Evita el relleno.
- Personaliza con el nombre y los puntajes de la empresa.
- No inventes datos que no te dieron. Si preguntan algo ajeno al diagnóstico, redirige amablemente.
- Al final, invita a seguir la conversación con preguntas de seguimiento.`;

export function isAdvisorConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
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

export function streamAdvisor(result: AdvisorResult, history: AdvisorMessage[]) {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

  const dims = [...result.dimensions]
    .sort((a, b) => a.score - b.score)
    .map((d) => `- ${d.name}: ${d.score.toFixed(1)}/10`)
    .join("\n");

  const context =
    `Empresa: ${result.company?.trim() || "(sin nombre)"}` +
    (result.sector ? ` · Sector: ${result.sector}` : "") +
    `\nPuntaje global: ${result.overall.toFixed(1)}/10 — Nivel ${result.levelName}.\n` +
    `Puntajes por dimensión (de menor a mayor):\n${dims}\n\n` +
    (history.length === 0
      ? "Genera el diagnóstico y el plan de acción para esta empresa."
      : "Usa estos resultados como contexto para responder la conversación.");

  return client.messages.stream({
    model: MODEL,
    max_tokens: 3000,
    thinking: { type: "adaptive" },
    system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
    messages: [{ role: "user", content: context }, ...history],
  });
}
