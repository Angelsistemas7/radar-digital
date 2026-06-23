# 🚦 Semáforo Digital

**Autodiagnóstico de Madurez Digital para empresas.** Un cuestionario web que mide la
madurez digital en **4 dimensiones** y entrega un **semáforo digital** (resultado
**cualitativo por colores, sin notas numéricas**) y un **diagnóstico**. Incluye un
**panel administrador** con gráficas y exportación de datos.

> Construido con Next.js 16 (App Router), React 19, TypeScript, Tailwind v4,
> Motion, Recharts y Supabase.

> 🔄 **Cambios recientes y avisos de mantenimiento** (qué se rediseñó, qué quedó sin
> uso y qué se puede dañar al tocar X): ver [`ARCHITECTURE.md`](./ARCHITECTURE.md)
> → secciones «Cambios recientes» y «Riesgos y puntos a vigilar».

---

## ✨ Características

- **Onboarding** con validación en vivo (Zod + react-hook-form) y **filtro anti-basura**
  (rechaza textos como `asasas`, correos temporales, teléfonos inválidos) + honeypot anti-bots.
  Incluye un **semáforo de estado** (ámbar por defecto → rojo si hay errores → verde si
  todo es válido) y **aura roja** alrededor de los campos inválidos.
- **Cuestionario animado** sección por sección, respuesta con **semáforo**
  (🔴 No · 🟡 Más o menos · 🟢 Sí), barra de progreso, **autoguardado** (se puede
  retomar si se cierra la página) y un **aura de color** que tiñe cada pregunta según
  la respuesta.
- **Resultado cualitativo (sin números)**: un **semáforo grande** con la luz del
  estado encendida (color **fuerte**, no gradual) y las **4 áreas** coloreadas según su
  estado, más 4 indicadores cualitativos y un diagnóstico. *(El resumen tipo semáforo en
  PDF existe en el motor; está previsto enviarlo por correo — hoy no hay botón de descarga
  en pantalla.)*
- **Tema claro** en todo el sitio (se retiró el modo oscuro).
- **Diagnóstico por reglas**: el plan de acción por fases (0–3, 3–6, 6–12 meses) se
  conserva en el motor y se incluye en el **PDF** y el **correo de lead**, pero ya
  **no** se muestra en la pantalla de resultados.
- **Panel administrador** protegido: KPIs, distribución por nivel, línea de tiempo,
  ranking por país, tabla filtrable y **exportación a CSV/Excel**.
- **Ciberseguridad**: cabeceras de seguridad + CSP, validación en el servidor,
  rate limiting, sesión de admin firmada (HMAC, cookie httpOnly), RLS en la base de
  datos y consentimiento de datos (Ley 1581 / Habeas Data).
- **Motor configurable**: dimensiones, preguntas, estados y umbrales viven en
  `src/lib/`; cambia ahí y el resultado se adapta. Los **umbrales del semáforo**
  (rojo < 3 · amarillo 3–8,9 · verde ≥ 9) están **centralizados** en
  `src/lib/scoring.ts` (`BAND_EDGES` / `levelIndexForScore`).

---

## 🚀 Empezar

Requisitos: **Node.js 20.9+**.

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

| Comando         | Descripción                         |
| --------------- | ----------------------------------- |
| `npm run dev`   | Servidor de desarrollo              |
| `npm run build` | Build de producción                 |
| `npm start`     | Servir la build de producción       |
| `npm run lint`  | Linter (ESLint)                     |

La app **funciona sin base de datos**: el diagnóstico se calcula igual y el panel
muestra **datos de ejemplo**. Conecta Supabase para guardar respuestas reales.

---

## 🔑 Variables de entorno

Copia `.env.example` a `.env.local` y completa:

```bash
# Supabase (persistencia). Sin esto, no se guardan los envíos.
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# Panel administrador
ADMIN_PASSWORD=radar-admin-2026
ADMIN_SESSION_SECRET=cadena-larga-aleatoria

# Seguridad (hash de IP para auditoría)
IP_HASH_SALT=otra-cadena-aleatoria
```

> La `SERVICE_ROLE_KEY` es **secreta** y solo se usa en el servidor. Nunca la
> expongas en el cliente ni la subas al repositorio (`.env.local` está en `.gitignore`).

---

## 🗄️ Configurar Supabase

1. Crea un proyecto gratis en [supabase.com](https://supabase.com).
2. En **SQL Editor**, pega y ejecuta el contenido de [`supabase/schema.sql`](./supabase/schema.sql).
3. En **Project Settings → API**, copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (en *Project API keys*) → `SUPABASE_SERVICE_ROLE_KEY`
4. Reinicia el servidor. A partir de ahí cada envío se guarda y el panel muestra datos reales.

La tabla `submissions` queda con **Row Level Security** activado y sin políticas
públicas: todo el acceso pasa por el servidor con la *service role key*.

---

## 🔐 Panel administrador

- Entra en [`/admin`](http://localhost:3000/admin). Si no hay sesión, redirige a
  `/admin/login`.
- Usa la `ADMIN_PASSWORD` definida en `.env.local`.
- La sesión es una cookie **httpOnly** firmada (HMAC) con caducidad de 8 horas.

---

## ☁️ Despliegue (VPS auto-hospedado)

> El proyecto **ya no se despliega en Vercel**. Se montó un despliegue propio
> (Docker + nginx + GitHub Actions) sobre **semaforodigital.com**.

- **Automático**: cada `git push origin main` dispara
  [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), que entra por SSH
  al VPS y hace `git pull` + `docker compose up -d --build`.
- **Manual**: `bash scripts/deploy.sh` desde tu máquina; primer arranque del servidor
  con `scripts/setup-vps.sh`.
- **Variables de entorno**: viven en el VPS en `.env.production` (no en Vercel).
- Detalles, mecanismos y avisos: ver [`ARCHITECTURE.md`](./ARCHITECTURE.md) →
  «Despliegue y entorno».

> El HTTPS lo da **nginx + Certbot** en el VPS, así que HSTS y las cookies `secure`
> siguen activas en producción.

---

## 🧩 Personalizar el cuestionario

Todo el contenido del test está en
[`src/lib/questionnaire.ts`](./src/lib/questionnaire.ts):

- Edita o agrega **dimensiones** (cada una es un área del semáforo).
- Cambia **preguntas**, **niveles de madurez** y **recomendaciones** por nivel.
- El semáforo, la puntuación y el diagnóstico se ajustan automáticamente.

---

## 🗂️ Estructura

```
src/
├─ app/
│  ├─ page.tsx                # Landing
│  ├─ diagnostico/            # Flujo del test (onboarding → cuestionario → resultado)
│  ├─ admin/                  # Panel + login
│  └─ api/                    # /respuestas, /admin/login, /admin/logout
├─ components/
│  ├─ assessment/             # Onboarding, cuestionario (semáforo)
│  ├─ results/                # Semáforo + vista de resultados (cualitativa)
│  ├─ admin/                  # Gráficas, tabla, login
│  ├─ landing/ · site/ · ui/  # Hero, header/footer, primitivas
├─ lib/                       # questionnaire, scoring, diagnosis, validation, supabase…
└─ proxy.ts                   # Protege /admin (antes "middleware")
supabase/schema.sql           # Esquema de la base de datos
```

---

## 🛣️ Próximos pasos

- **Correo de lead**: dejarlo cualitativo (hoy aún muestra puntajes) y enviar el
  **resumen tipo semáforo en PDF** por correo (sustituye al botón de descarga, que se
  retiró de la pantalla).
- **Pulido visual pendiente** (ver el texto de tareas para el equipo):
  - Latido del semáforo de **resultados** (la luz baja y sube de intensidad cada ~1,5–2 s).
  - Suavizar el **corte de color** entre el hero y la sección «Cómo funciona» del home.
  - Ajustar el tamaño del **semáforo del formulario** / el campo «Nombre del emprendimiento».
- **Asesor con IA**: el componente y el endpoint existen
  (`components/results/ai-advisor.tsx`, `app/api/asesor`) pero **se quitaron de la
  pantalla de resultados**. Decisión pendiente: reconectarlo o borrarlo (ver
  [`ARCHITECTURE.md`](./ARCHITECTURE.md)).
- Exportación directa a Google Drive / Sheets; benchmarking entre empresas.

---

Hecho con 💙 para impulsar la transformación digital.
