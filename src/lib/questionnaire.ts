import type { Questionnaire } from "./types";

/* ============================================================
   Radar Digital — Questionnaire configuration
   4 dimensions of digital maturity · 2 questions each.
   Each question is answered with a traffic light (red/amber/green)
   that maps to a 0-10 score. Results are shown qualitatively by
   color (no raw numbers). This is the single source of truth:
   edit here and the rest of the app adapts automatically.
   ============================================================ */

export const QUESTIONNAIRE: Questionnaire = {
  id: "madurez-digital",
  version: "3.0",
  title: "Diagnóstico de Madurez Digital",
  scale: {
    min: 0,
    max: 10,
    step: 5,
    anchors: [
      { value: 0, label: "No existe" },
      { value: 5, label: "En desarrollo" },
      { value: 10, label: "Consolidado" },
    ],
  },
  // The three answers shown as a traffic light on every question.
  // value feeds the 0-10 engine: rojo = 0, amarillo = 3, verde = 10.
  // "Más o menos" vale poco (3, no 5): "tal vez / no sé" no es media madurez,
  // es una capacidad que aún no está en pie. Esto sube la vara honestamente.
  responseOptions: [
    { id: "no", tone: "red", label: "No", hint: "Todavía no", value: 0 },
    {
      id: "parcial",
      tone: "amber",
      label: "Más o menos",
      hint: "Tal vez / no sé",
      value: 3,
    },
    { id: "si", tone: "green", label: "Sí", hint: "Ya lo hacemos", value: 10 },
  ],
  // Qualitative states by color on a 0-10 scale. Las respuestas son
  // rojo=0 · amarillo=3 · verde=10, con vara exigente: "más o menos" pesa poco.
  // "Todo más o menos" (promedio 3,0) queda en el PISO del amarillo; el rojo
  // aparece cuando hay algún "no" que arrastra por debajo de 3. Verde exige sí.
  //   rojo:     0   – 2,9   (hay "no" de verdad: a activar)
  //   amarillo: 3   – 7,9   (incluye "todo más o menos"; avance en marcha)
  //   verde:    8   – 10    (exigente: casi todo consolidado)
  // ⚠️ Cortes centralizados en scoring.ts (BAND_EDGES / levelIndexForScore).
  maturityLevels: [
    {
      id: 1,
      name: "Inicial",
      range: [0, 3],
      tagline: "Punto de partida",
      description:
        "La empresa está dando sus primeros pasos digitales. Hay una gran oportunidad de avanzar con acciones simples y de alto impacto.",
      color: "#ef4444",
    },
    {
      id: 2,
      name: "En desarrollo",
      range: [3, 8],
      tagline: "Avanzando con buen pie",
      description:
        "La transformación digital ya está en marcha en varias áreas. El reto es consolidar e integrar lo que funciona.",
      color: "#f59e0b",
    },
    {
      id: 3,
      name: "Consolidado",
      range: [8, 10.01],
      tagline: "Referente digital",
      description:
        "Lo digital está integrado en la estrategia y la operación. La empresa puede optimizar con datos y marcar la pauta en su sector.",
      color: "#22c55e",
    },
  ],
  dimensions: [
    {
      id: "estrategia",
      name: "Estrategia",
      title: "Estrategia Digital",
      icon: "Target",
      color: "#003087",
      description:
        "Visión, liderazgo y hoja de ruta que guían la transformación digital.",
      questions: [
        {
          id: "estrategia-q1",
          text: "¿Existe una estrategia de transformación digital documentada y con objetivos medibles?",
        },
        {
          id: "estrategia-q2",
          text: "¿La estrategia digital está alineada con las metas de la empresa?",
        },
      ],
      recommendations: {
        low: [
          "Define una visión digital simple a 12 meses con 3 objetivos medibles.",
          "Nombra un responsable o comité que lidere la transformación digital.",
          "Haz un diagnóstico de procesos para priorizar dónde digitalizar primero.",
        ],
        medium: [
          "Formaliza la hoja de ruta con metas trimestrales e indicadores (KPIs).",
          "Asigna un presupuesto recurrente y vincula los proyectos a resultados de negocio.",
          "Comunica la estrategia a todo el equipo para alinear los esfuerzos.",
        ],
        high: [
          "Conecta la estrategia digital con la innovación del modelo de negocio.",
          "Revisa los KPIs digitales en la junta directiva y ajústalos con datos.",
          "Documenta casos de éxito y conviértete en referente de tu sector.",
        ],
      },
    },
    {
      id: "cultura",
      name: "Cultura",
      title: "Cultura y Talento Digital",
      icon: "Users",
      color: "#14b8a6",
      description:
        "Competencias, capacitación y cultura de innovación del equipo.",
      questions: [
        {
          id: "cultura-q1",
          text: "¿El equipo cuenta con las competencias digitales necesarias para sus funciones?",
        },
        {
          id: "cultura-q2",
          text: "¿Se destinan recursos a probar ideas nuevas (pilotos, experimentos)?",
        },
      ],
      recommendations: {
        low: [
          "Mapea las brechas de habilidades digitales por cada rol.",
          "Inicia capacitaciones cortas y prácticas sobre las herramientas que ya usan.",
          "Designa 'embajadores digitales' que impulsen la adopción.",
        ],
        medium: [
          "Crea un plan de formación continuo con rutas por área.",
          "Reconoce e incentiva las mejoras propuestas por el equipo.",
          "Reserva tiempo y un pequeño presupuesto para pilotos y experimentos.",
        ],
        high: [
          "Implementa mentorías y comunidades internas de práctica.",
          "Mide la adopción de herramientas y la satisfacción del equipo.",
          "Atrae y retén talento digital con una cultura de aprendizaje continuo.",
        ],
      },
    },
    {
      id: "cliente",
      name: "Cliente",
      title: "Experiencia del Cliente",
      icon: "HeartHandshake",
      color: "#4f46e5",
      description:
        "Canales digitales, escucha y personalización en la relación con el cliente.",
      questions: [
        {
          id: "cliente-q1",
          text: "¿La empresa ofrece canales digitales para que el cliente interactúe (web, redes, app, chat)?",
        },
        {
          id: "cliente-q2",
          text: "¿Se recoge y utiliza la retroalimentación del cliente para mejorar productos o servicios?",
        },
      ],
      recommendations: {
        low: [
          "Habilita al menos un canal digital de atención (WhatsApp, formulario o chat).",
          "Crea una forma simple de recoger opiniones (encuesta post-venta).",
          "Publica información clara de tus productos y servicios en línea.",
        ],
        medium: [
          "Integra los canales en un solo lugar para no perder mensajes (omnicanalidad).",
          "Usa la retroalimentación para priorizar mejoras concretas.",
          "Digitaliza el proceso de compra y pago de inicio a fin.",
        ],
        high: [
          "Personaliza ofertas y comunicación con datos de comportamiento.",
          "Mide la satisfacción (NPS/CSAT) y cierra el ciclo con acciones de mejora.",
          "Automatiza la atención con autoservicio y respuestas inteligentes.",
        ],
      },
    },
    {
      id: "procesos",
      name: "Procesos",
      title: "Procesos y Operaciones",
      icon: "Workflow",
      color: "#0e7490",
      description:
        "Digitalización, automatización e integración de la operación.",
      questions: [
        {
          id: "procesos-q1",
          text: "¿Los procesos clave del negocio están digitalizados y documentados?",
        },
        {
          id: "procesos-q2",
          text: "¿Se aplican metodologías ágiles de mejora continua?",
        },
      ],
      recommendations: {
        low: [
          "Documenta y digitaliza tus 3 procesos más críticos.",
          "Reemplaza tareas manuales repetitivas con plantillas o herramientas no-code.",
          "Centraliza la información clave en un solo lugar accesible.",
        ],
        medium: [
          "Automatiza flujos entre áreas (por ejemplo, ventas → facturación).",
          "Integra tus sistemas para evitar reprocesos y errores.",
          "Adopta rituales ágiles simples (tableros, ciclos cortos, mejora continua).",
        ],
        high: [
          "Optimiza con automatización avanzada e integración por APIs.",
          "Aplica mejora continua basada en los datos de tus procesos.",
          "Explora IA para predecir cuellos de botella y optimizar la operación.",
        ],
      },
    },
  ],
};

export const DIMENSIONS = QUESTIONNAIRE.dimensions;
