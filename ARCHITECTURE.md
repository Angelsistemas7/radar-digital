# Semáforo Digital — Arquitectura del proyecto

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
- `responseOptions` → respuesta por pregunta (0/5/10): rojo=0, amarillo=5, verde=10.
- **Bandas centralizadas** en `src/lib/scoring.ts`:
  - `BAND_EDGES = { redMax: 3, amberMax: 9 }` — **fuente única de los cortes**.
  - `levelIndexForScore(score)` → 0 rojo · 1 amarillo · 2 verde (la luz encendida).
  - `levelForScore(score)` → estado = `maturityLevels[index]`.
  - Cortes: **rojo < 3 · amarillo 3–8,9 · verde ≥ 9**. Calibrados por el usuario: con
    respuestas 0/5/10 (mismo peso) el promedio salta de a poco, así que **rojo solo con
    varios "no"**, **verde exigente** (7 verdes + 1 amarilla = 9,4 → verde; 6 → amarillo),
    y amarillo es el centro amplio. `maturityLevels[].range` los refleja.
- `src/lib/utils.ts → scoreColor(score)` → color **SÓLIDO** (ya no gradual): rojo
  `#ef4444`, ámbar `#f59e0b`, verde `#22c55e`. Lo usan el semáforo, las áreas y el PDF.
- `bandForScore()` (recomendaciones del PDF/correo): **<3 low, <9 medium, ≥9 high**.

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
    results/              result-view · ai-advisor (SIN USO)
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

## 🔄 Cambios recientes (pase visual + fix de bandas, 2026-06-23)
Sobre la versión de los compañeros (rebrand a Semáforo Digital, `semaforo.tsx`,
nivel educativo, Postgres/Sheets). Qué cambió en este pase y dónde:

- **Fix de bandas** (definidas por el usuario, 2 iteraciones): **rojo <3 · amarillo
  3–8,9 · verde ≥9** centralizados en `scoring.ts` (`BAND_EDGES`, `levelIndexForScore`).
  Verde exigente, rojo solo con varios "no". Ver «Colores / semáforo».
- **Onboarding** (`onboarding-form.tsx`): semáforo de **estado** en la esquina sup. der.
  (ámbar por defecto · rojo si hay errores · verde si todo válido, vía `formState`) +
  wash tenue alrededor del formulario que sigue ese color. Campos inválidos con aura roja.
- **Cuestionario** (`questionnaire.tsx`): scroll a la siguiente pregunta con
  `animatedScrollTo` (easeInOutCubic, ~900 ms) para que sea más suave.
- **`scoreColor` ahora es SÓLIDO** (rojo/ámbar/verde fuertes), ya no gradual. Resultados,
  áreas y PDF muestran color fuerte.
- **`components/ui/semaforo.tsx` reescrito**: aspecto **3D** (gradientes, glow, brillo),
  tamaño `xl`, hook `useSemaforoCycle()` + `SemaforoCycle` (cicla rojo→amarillo→verde)
  y `AmbientWash` (blobs que tiñen el fondo del color actual).
- **Home** (`hero.tsx`, `page.tsx`): semáforo animado + wash en hero y en "Qué obtienes";
  copy a **autodiagnóstico**; features recortadas (sin chatbot/recos/plan por fases);
  CTA y subtítulos ajustados; widgets de "Cómo funciona" y "4 dimensiones" con micro-
  interacciones (hover lift, glow, watermark). Logo con luces más pequeñas.
- **Resultados** (`result-view.tsx`): tarjetas de dimensión con más contraste +
  descripción de 2 renglones; widgets con etiquetas a 2 líneas (móvil); print header
  «Semáforo Digital».
- **Onboarding** (`assessment-flow.tsx`): `AmbientWash` detrás del formulario.
- **Cuestionario** (`questionnaire.tsx`): aura sutil (barra + fondo) del color de la
  respuesta al contestar; liviano (solo box-shadow/bg, sin blur).
- **Modo oscuro neón desactivado** en las cabeceras públicas (se quitó `ThemeToggle` de
  `site-header` y `diagnostico`); el CSS `.dark` sigue ahí. Admin conserva su toggle.
- **Rebrand restante**: footer ©, headers de admin/login → «Semáforo Digital».

## 🔄 Cambios anteriores (rediseño cualitativo)
Resumen para no auditar a ciegas. Qué cambió en esa iteración y dónde:

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
1. **Umbrales ya casi centralizados.** La verdad vive en `scoring.ts → BAND_EDGES`
   (`levelIndexForScore`/`levelForScore`). Aún hay que mantener a mano los espejos:
   `questionnaire.ts → maturityLevels[].range` (mismos cortes 2,5 / 8) y los hex de
   `utils.ts → scoreColor`. Los cortes **asumen `round1`** (1 decimal): con respuestas
   0/5/10 no caen promedios justo en 2,5/8, así que no hay empates de frontera.
2. **El semáforo del PDF es una copia a mano** del de pantalla (`BigTrafficLight` en
   `result-view.tsx` vs. el dibujo jsPDF en `pdf.ts`). **No se sincronizan solos**: si
   cambias colores/forma/tamaño en uno, hay que replicarlo en el otro.
3. **Código sin uso (no borrado)** — limpiar o reconectar, según se decida:
   - `components/results/ai-advisor.tsx` + ruta `app/api/asesor` + `lib/ai/advisor.ts`
     (+ deps `@anthropic-ai/sdk`, `@google/genai`, `openai`): el asesor ya no se
     muestra. Si no se reconecta, se pueden borrar para aligerar el bundle.
   - `components/results/semaforo.tsx`: semáforo animado reutilizable (sm/md/lg).
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
**Despliegue auto-hospedado en VPS, ya NO Vercel** — lo montó @Manuel (commits
`8cad3fa`, `7accffd`). Dominio: **semaforodigital.com**.

- **Modelo**: Docker (Next.js `output: "standalone"`, `Dockerfile`) → contenedor en
  `127.0.0.1:3000` → **nginx** (80/443, `nginx/semaforodigital.com.conf`) → **Certbot**
  (SSL). Orquesta `docker-compose.yml`. VPS `158.101.105.13`, app en `/opt/radar-digital`.
- **CI/CD**: `git push origin main` dispara `.github/workflows/deploy.yml`, que entra por
  SSH al VPS y corre `git pull` + `docker compose up -d --build`. Requiere secrets de
  GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.
- **Deploy manual** (alternativa): `bash scripts/deploy.sh` (rsync + rebuild por SSH);
  preparación inicial del servidor con `scripts/setup-vps.sh` (Docker, nginx, Certbot).
- **Variables de entorno**: en el VPS, archivo **`.env.production`** (lo lee
  `docker-compose.yml` con `env_file`), **no** en Vercel. Vars: `SUPABASE_URL`,
  `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `IP_HASH_SALT`,
  `RESEND_API_KEY`, `LEAD_NOTIFY_EMAIL`, y opcional una key de IA.
- **Local**: `npm install` · `npm run dev` (localhost:3000) · `npm run build`.
  ⚠️ Se añadió la dependencia `qrcode`: corre `npm install` para sincronizar `node_modules`.
- Atajo local: doble clic en `Iniciar Semáforo Digital.bat`.

> ⚠️ Coexisten **dos** mecanismos de deploy: GitHub Actions hace `git pull` en el VPS
> (despliega lo que está en GitHub), mientras `scripts/deploy.sh` hace `rsync` desde tu
> máquina (sube tus archivos locales, incluso sin commitear). Usa uno u otro con cuidado
> para no desincronizar el VPS.

## Backups
Tags de git marcan estados estables. P. ej. `v1-8dimensiones` = versión previa
al rediseño de 4 secciones + semáforo grande. Restaurar: `git checkout <tag>`.
