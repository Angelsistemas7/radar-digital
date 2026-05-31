# 🛰️ Radar Digital

**Diagnóstico de Madurez Digital para empresas.** Un cuestionario web que mide la
madurez digital en **8 dimensiones** y entrega un **radar interactivo**, un
**diagnóstico** y un **plan de acción** por fases. Incluye un **panel administrador**
con gráficas y exportación de datos.

> Construido con Next.js 16 (App Router), React 19, TypeScript, Tailwind v4,
> Motion, Recharts y Supabase.

---

## ✨ Características

- **Onboarding** con validación en vivo (Zod + react-hook-form) y **filtro anti-basura**
  (rechaza textos como `asasas`, correos temporales, teléfonos inválidos) + honeypot anti-bots.
- **Cuestionario animado** sección por sección, slider 0–10 con color dinámico,
  barra de progreso y **autoguardado** (se puede retomar si se cierra la página).
- **Resultado** con radar SVG animado, puntaje global con anillo, nivel de madurez
  (Incipiente → Líder Digital), fortalezas/debilidades y descarga en PDF.
- **Diagnóstico + plan de acción** por reglas (0–3, 3–6, 6–12 meses), con la
  interfaz lista para conectar IA generativa más adelante.
- **Panel administrador** protegido: KPIs, radar agregado, distribución por nivel,
  línea de tiempo, ranking por país, tabla filtrable y **exportación a CSV/Excel**.
- **Ciberseguridad**: cabeceras de seguridad + CSP, validación en el servidor,
  rate limiting, sesión de admin firmada (HMAC, cookie httpOnly), RLS en la base de
  datos y consentimiento de datos (Ley 1581 / Habeas Data).
- **Motor configurable**: las dimensiones y preguntas viven en un solo archivo; el
  radar se adapta solo a 5, 8 o N ejes.

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

## ☁️ Despliegue en Vercel

1. Sube el proyecto a GitHub.
2. En [vercel.com](https://vercel.com) → **New Project** → importa el repo.
3. **Importante**: si el repo contiene la carpeta `radar-digital`, configura
   **Root Directory = `radar-digital`**.
4. Agrega las **variables de entorno** (las mismas de `.env.local`).
5. Deploy. Comparte el enlace `https://tu-proyecto.vercel.app` 🎉

> Vercel sirve la app por HTTPS, por lo que HSTS y las cookies `secure` quedan activas.

---

## 🧩 Personalizar el cuestionario

Todo el contenido del test está en
[`src/lib/questionnaire.ts`](./src/lib/questionnaire.ts):

- Edita o agrega **dimensiones** (cada una es un eje del radar).
- Cambia **preguntas**, **niveles de madurez** y **recomendaciones** por nivel.
- El radar, la puntuación y el diagnóstico se ajustan automáticamente.

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
│  ├─ assessment/             # Onboarding, cuestionario, slider
│  ├─ results/                # Radar SVG + vista de resultados
│  ├─ admin/                  # Gráficas, tabla, login
│  ├─ landing/ · site/ · ui/  # Hero, header/footer, primitivas
├─ lib/                       # questionnaire, scoring, diagnosis, validation, supabase…
└─ proxy.ts                   # Protege /admin (antes "middleware")
supabase/schema.sql           # Esquema de la base de datos
```

---

## 🛣️ Próximos pasos

- **Asesor con IA**: conectar la API de Claude para un chatbot que explique las
  debilidades y co-diseñe el plan de acción (la interfaz ya está preparada en
  `src/lib/diagnosis.ts`).
- Exportación directa a Google Drive / Sheets.
- Comparativas por sector y benchmarking entre empresas.

---

Hecho con 💙 para impulsar la transformación digital.
