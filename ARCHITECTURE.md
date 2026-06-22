# Radar Digital — Arquitectura del proyecto

Documento de referencia para entender y modificar el proyecto rápido (también
para abrir un chat nuevo con contexto y gastar menos tokens). Léelo junto con
el `README.md` de la carpeta raíz (estado, despliegue, variables de entorno).

> ⚠️ **Next.js 16.2.6** — no es como el del entrenamiento (App Router,
> Turbopack, `proxy.ts` en vez de `middleware.ts`, `params`/`cookies` async).
> Ver `AGENTS.md`.

## Qué es
App web que mide la **madurez digital** de una empresa. El usuario responde un
cuestionario con un **semáforo** (🔴 No · 🟡 Más o menos · 🟢 Sí) y obtiene un
diagnóstico cualitativo por colores, un plan de acción y un PDF/correo.

## Stack
Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 (`@theme`, sin
config) · Motion (animaciones) · Recharts (gráficas admin) · jsPDF (PDF) ·
Supabase (Postgres + RLS) · Resend (correos) · IA multi-proveedor
(Claude/Gemini/Groq/OpenRouter). Despliegue en Vercel (push a `main` = deploy).

## Modelo de datos del cuestionario — fuente única de verdad
**`src/lib/questionnaire.ts`** define TODO el test. Cambiar aquí y el resto
(radar, scoring, diagnóstico, resultados) se adapta solo.

- `dimensions[]` — las **4 secciones** (estrategia, cultura, cliente, procesos),
  cada una con `id`, `name`, `title`, `icon` (Lucide), `color`, `description`,
  `questions[]` (**2 por dimensión**) y `recommendations` por banda (low/medium/high).
- `responseOptions[]` — el semáforo: `no`=0 (rojo), `parcial`=5 (amarillo),
  `si`=10 (verde). El valor alimenta la escala interna 0–10.
- `maturityLevels[]` — **3 estados** por color: Inicial (0–5, rojo), En
  desarrollo (5–9, amarillo), Consolidado (9–10, verde).

## Colores / semáforo
- `responseOptions` → respuesta por pregunta (0/5/10).
- `src/lib/utils.ts → scoreColor(score)` → color **gradual** rojo→amarillo→verde
  para un puntaje 0–10 (semáforo grande, indicadores por sección).
- `src/lib/scoring.ts → levelForScore()` → estado (Inicial/En desarrollo/
  Consolidado) según las bandas; `bandForScore()` (<5 low, <9 medium, ≥9 high)
  elige las recomendaciones.

## Flujo de una evaluación
1. **Onboarding** (`components/assessment/onboarding-form.tsx`): datos de la
   empresa + persona, validados con Zod (`lib/validation.ts`). Anti-spam:
   honeypot, validaciones.
2. **Cuestionario** (`components/assessment/questionnaire.tsx` +
   `traffic-light.tsx`): semáforo por pregunta, auto-avance, progreso por
   dimensión. Estado en `lib/storage.ts` (localStorage, reanudable).
3. **Scoring** (`lib/scoring.ts`): promedia respuestas → puntaje 0–10 por
   dimensión y global → estado por color. (El servidor recalcula, nunca confía
   en el cliente.)
4. **Resultados** (`components/results/result-view.tsx`): semáforo grande,
   estado por sección, diagnóstico + plan, descargar PDF, asesor IA.
5. **Guardado** (`lib/submissions.ts` → Supabase) + **aviso por correo**
   (`lib/notify.ts` → Resend) + webhook opcional (`N8N_WEBHOOK_URL`).

## Mapa de carpetas (lo que importa)
```
src/
  app/
    layout.tsx            Root layout, fuentes, tema (script anti-flash)
    page.tsx              Home (landing)
    diagnostico/page.tsx  Flujo del test
    admin/                Panel protegido (KPIs, gráficas, tabla)
    api/                  respuestas · contacto · asesor · benchmark · admin
    opengraph-image.tsx   Imagen para compartir el sitio
  components/
    landing/hero.tsx
    assessment/           onboarding-form · questionnaire · traffic-light · assessment-flow
    results/              result-view · radar-chart · ai-advisor
    admin/                submissions-table · admin-charts · ...
    ui/                   button · logo · theme-toggle · reveal · dimension-icon
  lib/
    questionnaire.ts      ← fuente única del test (4 dims × 2 preguntas)
    types.ts              Tipos del dominio
    scoring.ts            Puntajes, estados, bandas
    diagnosis.ts          Diagnóstico + plan por fases (reglas; reemplazable por IA)
    utils.ts              cn, formatScore, scoreColor (color gradual)
    pdf.ts                Reporte PDF (jsPDF)
    share-card.ts         Tarjeta PNG (canvas)
    notify.ts             Correo de lead (Resend)
    submissions.ts        Guardado + agregados del admin (+ datos demo)
    storage.ts            Persistencia local del test
    validation.ts         Esquemas Zod del onboarding
    ai/advisor.ts         Asesor IA multi-proveedor (system prompt)
    supabase/server.ts    Cliente service-role
    admin-auth.ts         Sesión admin (cookie HMAC)
  proxy.ts                Middleware (cabeceras de seguridad, guard admin)
```

## Despliegue y entorno
- `git push origin main` → deploy automático en Vercel. **No** usar `vercel` CLI.
- Variables (Vercel / `.env.local`): `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`,
  `IP_HASH_SALT`, `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, y una key de IA
  (`ANTHROPIC_API_KEY` | `GEMINI_API_KEY` | `GROQ_API_KEY` | `OPENROUTER_API_KEY`).
- Local: `npm install` · `npm run dev` (localhost:3000) · `npm run build`.
- Atajo: doble clic en `Iniciar Radar Digital.bat` (carpeta raíz).

## Backups
Tags de git marcan estados estables. P. ej. `v1-8dimensiones` = versión previa
al rediseño de 4 secciones + semáforo grande. Restaurar: `git checkout <tag>`.
