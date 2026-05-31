# 🚀 Guía de despliegue — Radar Digital

> La app **ya funciona** sin nada de esto (el diagnóstico y el plan por reglas son
> gratis y no necesitan base de datos ni IA). Esta guía es para tener tu **link
> público compartible**, **guardar los datos** y activar el **chat con IA**.

Tiempo aprox: **10–15 minutos**. Todo lo de abajo tiene plan gratuito.

---

## 1) Base de datos — Supabase (gratis)

1. Entra a **https://supabase.com** → crea cuenta → **New project**.
   - Elige una región cercana (ej. *East US*), pon una contraseña de base de datos y crea.
   - Espera ~2 minutos a que se aprovisione.
2. En el menú izquierdo: **SQL Editor → New query**.
   - Abre el archivo **`supabase/schema.sql`** de este proyecto, copia **todo** su
     contenido, pégalo y haz clic en **Run**. (Crea la tabla con seguridad RLS.)
3. Ve a **Settings → API** y copia dos valores:
   - **Project URL** → será `SUPABASE_URL`
   - **service_role** key (en *Project API keys*) → será `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ La *service_role* es **secreta**. Nunca la pongas en el navegador ni la subas a git.

> ¿Sin Supabase? La app igual funciona; solo que no se guardan los envíos y el
> panel `/admin` muestra datos de ejemplo.

---

## 2) Asesor con IA — gratis con Google Gemini (opcional)

1. Entra a **https://aistudio.google.com/apikey** e inicia sesión con Google.
2. **Create API key** → copia la key (empieza con `AIza...`). *No pide tarjeta.*
3. Será la variable `GEMINI_API_KEY`.

> Alternativas: **Groq** (`GROQ_API_KEY`, gratis, en https://console.groq.com/keys)
> o **Claude/Anthropic** (`ANTHROPIC_API_KEY`, de pago, mejor calidad).
> La app usa automáticamente la primera key que encuentre.

---

## 3) Desplegar en Vercel (gratis)

### Opción A — desde tu terminal (rápida, sin GitHub)

```bash
cd radar-digital
npx vercel login      # abre el navegador, confirma tu correo
npx vercel --prod     # responde las preguntas (Enter en casi todas)
```

Cuando termine te dará una URL como `https://radar-digital-xxxx.vercel.app`.
**¡Ese es tu link para compartir!** 🎉

### Opción B — con GitHub (auto-redespliega al hacer cambios)

1. Sube este repo a GitHub (crea un repo y `git push`).
2. Entra a **https://vercel.com/new**, importa el repositorio y haz **Deploy**.

---

## 4) Variables de entorno en Vercel

En tu proyecto de Vercel: **Settings → Environment Variables**. Agrega:

| Variable                     | Valor                                            | ¿Obligatoria? |
| ---------------------------- | ------------------------------------------------ | ------------- |
| `SUPABASE_URL`               | Tu Project URL de Supabase                        | Para guardar datos |
| `SUPABASE_SERVICE_ROLE_KEY`  | Tu service_role key                               | Para guardar datos |
| `ADMIN_PASSWORD`             | La clave para entrar a `/admin`                   | Sí (admin) |
| `ADMIN_SESSION_SECRET`       | Una cadena larga y aleatoria                       | Sí (admin) |
| `IP_HASH_SALT`               | Otra cadena aleatoria                              | Recomendada |
| `GEMINI_API_KEY`             | Tu key de Gemini (o `GROQ_API_KEY` / `ANTHROPIC_API_KEY`) | Para el chat IA |
| `N8N_WEBHOOK_URL`            | URL de tu webhook n8n/Make (Sheets, Drive…)       | Opcional |

Después de agregarlas: **Deployments → (los tres puntos) → Redeploy** para que las tome.

---

## 5) Probar

- Abre tu URL pública → completa el test → mira tu radar y el asesor IA.
- Entra a **`tu-url/admin`** con tu `ADMIN_PASSWORD` para ver el panel y exportar CSV.

---

## Notas

- `.env.local` (tus llaves locales) **no se sube** a git ni a Vercel; en Vercel
  usas la sección *Environment Variables*.
- Si importas por GitHub y el repositorio tiene `radar-digital` como subcarpeta,
  pon **Root Directory = `radar-digital`** en la configuración del proyecto de Vercel.
  (Si el repo ya es la carpeta `radar-digital`, no hace falta.)
- Plan gratuito de Vercel: ideal para clase y demos. El test es público; el panel
  `/admin` queda protegido con tu contraseña.
