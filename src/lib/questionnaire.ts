import type { Questionnaire } from "./types";

/* ============================================================
   Radar Digital — Questionnaire configuration
   8 dimensions of digital maturity · 4 questions each · scale 0-10.
   This is the single source of truth. Edit here to change the
   test; the radar, scoring and diagnosis adapt automatically.
   ============================================================ */

export const QUESTIONNAIRE: Questionnaire = {
  id: "madurez-digital",
  version: "1.0",
  title: "Diagnóstico de Madurez Digital",
  scale: {
    min: 0,
    max: 10,
    step: 0.1,
    anchors: [
      { value: 0, label: "No existe" },
      { value: 5, label: "En desarrollo" },
      { value: 10, label: "Consolidado" },
    ],
  },
  maturityLevels: [
    {
      id: 1,
      name: "Incipiente",
      range: [0, 2],
      tagline: "Punto de partida",
      description:
        "La empresa apenas inicia su camino digital. Predominan los procesos manuales y las decisiones por intuición.",
      color: "#dc2626",
    },
    {
      id: 2,
      name: "Básico",
      range: [2, 4],
      tagline: "Primeros pasos",
      description:
        "Existen esfuerzos digitales aislados, pero aún sin una estrategia que los conecte y potencie.",
      color: "#ea580c",
    },
    {
      id: 3,
      name: "En desarrollo",
      range: [4, 6],
      tagline: "Construyendo capacidades",
      description:
        "La transformación digital avanza en varias áreas, con bases sólidas que falta consolidar e integrar.",
      color: "#d97706",
    },
    {
      id: 4,
      name: "Avanzado",
      range: [6, 8],
      tagline: "Ventaja digital",
      description:
        "Lo digital está integrado en la operación y la estrategia, generando valor medible para el negocio.",
      color: "#16a34a",
    },
    {
      id: 5,
      name: "Líder Digital",
      range: [8, 10.01],
      tagline: "Referente de transformación",
      description:
        "La empresa innova con lo digital, optimiza con datos y marca la pauta en su sector.",
      color: "#0e7490",
    },
  ],
  dimensions: [
    {
      id: "estrategia",
      name: "Estrategia",
      title: "Estrategia Digital",
      icon: "Target",
      color: "#0e7490",
      description:
        "Visión, liderazgo y hoja de ruta que guían la transformación digital.",
      questions: [
        {
          id: "estrategia-q1",
          text: "¿Existe una estrategia de transformación digital documentada y con objetivos medibles?",
        },
        {
          id: "estrategia-q2",
          text: "¿La dirección lidera e invierte activamente en las iniciativas digitales?",
        },
        {
          id: "estrategia-q3",
          text: "¿La estrategia digital está alineada con el modelo de negocio y las metas de la empresa?",
        },
        {
          id: "estrategia-q4",
          text: "¿Se asignan presupuesto y responsables específicos a los proyectos digitales?",
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
      color: "#4f46e5",
      description:
        "Competencias, capacitación y cultura de innovación del equipo.",
      questions: [
        {
          id: "cultura-q1",
          text: "¿El equipo cuenta con las competencias digitales necesarias para sus funciones?",
        },
        {
          id: "cultura-q2",
          text: "¿La empresa capacita y actualiza de forma continua a su personal en herramientas digitales?",
        },
        {
          id: "cultura-q3",
          text: "¿Existe apertura al cambio y a la experimentación (cultura de innovación)?",
        },
        {
          id: "cultura-q4",
          text: "¿Se usan herramientas digitales para colaborar y comunicarse internamente?",
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
          "Estandariza las herramientas de colaboración (documentos, tareas, comunicación).",
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
      color: "#db2777",
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
        {
          id: "cliente-q3",
          text: "¿El recorrido de compra del cliente está digitalizado de principio a fin?",
        },
        {
          id: "cliente-q4",
          text: "¿Se personaliza la oferta o la comunicación según el perfil de cada cliente?",
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
      color: "#d97706",
      description:
        "Digitalización, automatización e integración de la operación.",
      questions: [
        {
          id: "procesos-q1",
          text: "¿Los procesos clave del negocio están digitalizados y documentados?",
        },
        {
          id: "procesos-q2",
          text: "¿Se utilizan herramientas para automatizar tareas repetitivas?",
        },
        {
          id: "procesos-q3",
          text: "¿Las áreas comparten información en sistemas integrados (sin islas de datos)?",
        },
        {
          id: "procesos-q4",
          text: "¿Se miden indicadores de eficiencia operativa de forma digital?",
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
          "Define indicadores operativos y tableros de seguimiento.",
        ],
        high: [
          "Optimiza con automatización avanzada e integración por APIs.",
          "Aplica mejora continua basada en los datos de tus procesos.",
          "Explora IA para predecir cuellos de botella y optimizar la operación.",
        ],
      },
    },
    {
      id: "tecnologia",
      name: "Tecnología",
      title: "Tecnología e Infraestructura",
      icon: "Server",
      color: "#0284c7",
      description: "Infraestructura, nube y capacidad para escalar.",
      questions: [
        {
          id: "tecnologia-q1",
          text: "¿La empresa cuenta con la infraestructura tecnológica que necesita (equipos, conectividad)?",
        },
        {
          id: "tecnologia-q2",
          text: "¿Se utilizan servicios en la nube para operar o almacenar información?",
        },
        {
          id: "tecnologia-q3",
          text: "¿Los sistemas y herramientas se mantienen actualizados?",
        },
        {
          id: "tecnologia-q4",
          text: "¿La tecnología actual permite crecer o escalar sin grandes obstáculos?",
        },
      ],
      recommendations: {
        low: [
          "Evalúa equipos, conectividad y software; resuelve primero lo más limitante.",
          "Migra tus documentos y herramientas básicas a la nube.",
          "Crea un inventario tecnológico y un plan de actualización.",
        ],
        medium: [
          "Adopta herramientas en la nube acordes a tu operación (CRM, ERP, etc.).",
          "Define políticas de actualización y soporte.",
          "Asegura respaldos automáticos y continuidad del servicio.",
        ],
        high: [
          "Diseña una arquitectura escalable e integrada.",
          "Optimiza los costos de nube y monitorea el rendimiento.",
          "Incorpora capacidades avanzadas (analítica, IA) sobre tu infraestructura.",
        ],
      },
    },
    {
      id: "datos",
      name: "Datos",
      title: "Datos y Analítica",
      icon: "Database",
      color: "#7c3aed",
      description: "Captura, calidad y uso de datos para tomar decisiones.",
      questions: [
        {
          id: "datos-q1",
          text: "¿La empresa recopila datos de su operación y clientes de forma estructurada?",
        },
        {
          id: "datos-q2",
          text: "¿Se utilizan tableros o reportes para tomar decisiones basadas en datos?",
        },
        {
          id: "datos-q3",
          text: "¿Existe calidad y orden en los datos (centralizados y confiables)?",
        },
        {
          id: "datos-q4",
          text: "¿Se aprovechan los datos para anticipar tendencias o detectar oportunidades?",
        },
      ],
      recommendations: {
        low: [
          "Empieza a registrar datos clave de ventas, clientes y operación.",
          "Centraliza la información en una sola fuente confiable.",
          "Crea un reporte básico para revisar resultados cada semana.",
        ],
        medium: [
          "Construye tableros (dashboards) con tus indicadores principales.",
          "Mejora la calidad de los datos (limpieza, reglas y responsables).",
          "Toma decisiones con base en los datos, no solo en la intuición.",
        ],
        high: [
          "Aplica analítica avanzada y segmentación para descubrir oportunidades.",
          "Explora modelos predictivos o IA para anticipar la demanda.",
          "Gobierna los datos con políticas de calidad y acceso.",
        ],
      },
    },
    {
      id: "innovacion",
      name: "Innovación",
      title: "Innovación y Modelo de Negocio",
      icon: "Rocket",
      color: "#059669",
      description: "Nuevos productos, ingresos digitales y agilidad de negocio.",
      questions: [
        {
          id: "innovacion-q1",
          text: "¿La empresa explora nuevos productos, servicios o canales digitales?",
        },
        {
          id: "innovacion-q2",
          text: "¿Parte de los ingresos proviene de productos o canales digitales?",
        },
        {
          id: "innovacion-q3",
          text: "¿Se destinan recursos a probar ideas nuevas (pilotos, experimentos)?",
        },
        {
          id: "innovacion-q4",
          text: "¿El modelo de negocio se adapta con agilidad a los cambios del mercado?",
        },
      ],
      recommendations: {
        low: [
          "Reserva tiempo y recursos para explorar 1 o 2 ideas digitales.",
          "Lanza un canal de venta digital piloto (e-commerce, marketplace).",
          "Observa a referentes del sector para inspirarte.",
        ],
        medium: [
          "Valida ideas con experimentos rápidos y de bajo costo.",
          "Mide qué porcentaje de ingresos viene de lo digital y hazlo crecer.",
          "Crea un proceso simple para capturar y probar ideas.",
        ],
        high: [
          "Sistematiza la innovación con un portafolio de iniciativas.",
          "Explora nuevos modelos de negocio (suscripción, plataforma, datos).",
          "Escala lo que funciona y retira lo que no aporta valor.",
        ],
      },
    },
    {
      id: "ciberseguridad",
      name: "Ciberseguridad",
      title: "Ciberseguridad y Protección de Datos",
      icon: "ShieldCheck",
      color: "#dc2626",
      description:
        "Protección de la información y cumplimiento (Habeas Data).",
      questions: [
        {
          id: "ciberseguridad-q1",
          text: "¿Existen medidas para proteger la información (contraseñas seguras, antivirus, control de accesos)?",
        },
        {
          id: "ciberseguridad-q2",
          text: "¿La empresa cumple con la protección de datos personales (ej. Ley de Habeas Data)?",
        },
        {
          id: "ciberseguridad-q3",
          text: "¿El personal está capacitado para prevenir riesgos digitales (phishing, fraudes)?",
        },
        {
          id: "ciberseguridad-q4",
          text: "¿Existen copias de seguridad y un plan ante incidentes o pérdida de datos?",
        },
      ],
      recommendations: {
        low: [
          "Activa contraseñas fuertes y doble factor en las cuentas críticas.",
          "Haz copias de seguridad automáticas de la información importante.",
          "Publica una política básica de tratamiento de datos personales.",
        ],
        medium: [
          "Capacita al equipo en phishing y buenas prácticas de seguridad.",
          "Define roles y permisos de acceso a la información.",
          "Cumple formalmente con la normativa de datos (autorización Habeas Data).",
        ],
        high: [
          "Implementa un plan de respuesta a incidentes y pruébalo periódicamente.",
          "Realiza auditorías de seguridad y monitoreo continuo.",
          "Refuerza el gobierno de datos y certifica tus procesos.",
        ],
      },
    },
  ],
};

export const DIMENSIONS = QUESTIONNAIRE.dimensions;
