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
- `maturityLevels[]` — **3 estados** por color: Inicial (**0–6**, rojo), En
  desarrollo (**6,1–9**, amarillo), Consolidado (**9,1–10**, verde).
  ⚠️ Estos cortes están **duplicados en 3 archivos** (ver «Riesgos»).

## Colores / semáforo
- `responseOptions` → respuesta por pregunta (0/5/10).
- `src/lib/utils.ts → scoreColor(score)` → color **gradual** rojo→amarillo→verde
  para un puntaje 0–10 (paradas en **0 → 6 → 9 → 10**, `COLOR_STOPS`). Lo usan el
  semáforo grande y los indicadores por área.
- `src/lib/scoring.ts → levelForScore()` → estado (Inicial/En desarrollo/
  Consolidado) según las bandas; `bandForScore()` (**<6,1 low, <9,1 medium, ≥9,1 high**)
  elige las recomendaciones. Mantén estos cortes alineados con `maturityLevels` y con
  las paradas de `scoreColor` (ver «Riesgos»).

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
4. **Resultados** (`components/results/result-view.tsx`): **100% cualitativo, sin
   números**. Semáforo grande (izq.) + las 4 áreas por estado (der.), 4 indicadores
   cualitativos, diagnóstico y botón **«Descargar mi semáforo digital»** (PDF). Ya
   **no** hay radar, barras con puntaje, plan de acción ni asesor IA en pantalla
   (el plan y el asesor siguen en el código; ver «Riesgos»).
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
    results/              result-view · radar-chart (SIN USO) · ai-advisor (SIN USO)
    admin/                submissions-table · admin-charts · ...
    ui/                   button · logo · theme-toggle · reveal · dimension-icon
  lib/
    questionnaire.ts      ← fuente única del test (4 dims × 2 preguntas)
    types.ts              Tipos del dominio
    scoring.ts            Puntajes, estados, bandas
    diagnosis.ts          Diagnóstico + plan por fases (reglas; reemplazable por IA)
    utils.ts              cn, formatScore, scoreColor (gradual), mix (mezcla color)
    pdf.ts                PDF «Semáforo Digital» (jsPDF) — copia A MANO del semáforo
    share-card.ts         Tarjeta PNG (canvas) — SIN USO (se quitó «Compartir imagen»)
    notify.ts             Correo de lead (Resend) — OJO: aún con números
    submissions.ts        Guardado + agregados del admin (+ datos demo)
    storage.ts            Persistencia local del test
    validation.ts         Esquemas Zod del onboarding
    ai/advisor.ts         Asesor IA multi-proveedor — SIN USO en resultados
    supabase/server.ts    Cliente service-role
    admin-auth.ts         Sesión admin (cookie HMAC)
  proxy.ts                Middleware (cabeceras de seguridad, guard admin)
```

## 🔄 Cambios recientes (rediseño cualitativo)
Resumen para no auditar a ciegas. Qué cambió en esta iteración y dónde:

- **Umbrales de estado** (`scoring.ts`, `questionnaire.ts`, `utils.ts`):
  rojo **0–6**, amarillo **6,1–9**, verde **9,1–10** (antes 0–5 / 5–9 / 9–10).
- **Pantalla de resultados** (`components/results/result-view.tsx`) reescrita: sin
  números; semáforo grande + 4 áreas por estado + 4 indicadores cualitativos. Se
  **quitaron**: radar, barras de puntaje, tarjetas fortalezas/debilidades, **plan de
  acción**, **asesor IA**, el toggle «¿quieres que te contactemos?» y el botón
  «Compartir imagen».
- **Contacto**: ahora **siempre** se manda `wantsContact: true` (todo el que termina
  es lead). El endpoint `api/contacto` no cambió.
- **Botón de descarga** renombrado a **«Descargar mi semáforo digital»**.
- **PDF** (`lib/pdf.ts`) rediseñado como semáforo: semáforo grande que **replica el
  de pantalla**, 4 áreas por color, leyenda de 3 estados; **sin radar, sin escalera
  de 5 niveles y sin números**. Archivo: `Semaforo-Digital-<empresa>.pdf`.
- **Diagnóstico** (`lib/diagnosis.ts`): el resumen ya no incluye cifras.

## ⚠️ Riesgos y puntos a vigilar (qué se puede dañar)
1. **Umbrales duplicados en 3 sitios.** Si cambias las bandas, edítalas en los TRES o
   quedan inconsistentes: `questionnaire.ts → maturityLevels[].range`,
   `scoring.ts → bandForScore()` y `utils.ts → COLOR_STOPS` (parada de `scoreColor`).
   Los cortes 6,1 / 9,1 **asumen puntajes redondeados a 1 decimal** (`round1`): no
   uses 6,05 ni medios puntos como frontera.
2. **El semáforo del PDF es una copia a mano** del de pantalla (`BigTrafficLight` en
   `result-view.tsx` vs. el dibujo jsPDF en `pdf.ts`). **No se sincronizan solos**: si
   cambias colores/forma/tamaño en uno, hay que replicarlo en el otro.
3. **Código sin uso (no borrado)** — limpiar o reconectar, según se decida:
   - `components/results/ai-advisor.tsx` + ruta `app/api/asesor` + `lib/ai/advisor.ts`
     (+ deps `@anthropic-ai/sdk`, `@google/genai`, `openai`): el asesor ya no se
     muestra. Si no se reconecta, se pueden borrar para aligerar el bundle.
   - `components/results/radar-chart.tsx`: el radar se quitó de resultados.
   - `lib/share-card.ts`: la tarjeta PNG se quitó («Compartir imagen»).
4. **El plan de acción sigue vivo en el motor** (`diagnosis.ts → plan`) aunque no se
   vea en pantalla: lo usan el **PDF** y el **correo de lead** (`notify.ts`). **No
   borres** `generateDiagnosis` ni los campos `ActionItem.score` / `target`.
5. **El correo de lead aún muestra números** (`notify.ts`: puntaje global, por
   dimensión, metas del plan). La UI y el PDF ya son sin cifras; el correo no. Si se
   busca coherencia total, falta actualizar `notify.ts`.
6. **Privacidad / leads.** Al no haber opción «No, gracias», cada persona que termina
   queda marcada para contacto. Verificar que sea aceptable (Habeas Data / Ley 1581).

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
