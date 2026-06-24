# 🎨 Marca (white-label) — guía completa

Este proyecto es **white-label**: una sola base de código sirve varias marcas
(Semáforo Digital, UTB, y las que agregues). La marca se elige con **una variable
de entorno** y todo el sitio se adapta solo: nombre, logo, colores, metadata,
footer y co-branding.

> **Marca activa por defecto:** `utb`. Por eso hoy `semaforodigital.online`
> muestra la marca UTB sin configurar nada.

---

## 1. El mapa: qué controla cada archivo

| Quieres cambiar… | Archivo |
|---|---|
| Nombre, entidad legal, dominio, descripción, co-branding | [`src/lib/brand.ts`](src/lib/brand.ts) |
| Colores (primario, acento) | [`src/app/globals.css`](src/app/globals.css) → bloque `[data-brand="…"]` |
| Logo del header/footer | [`public/`](public/) (SVG/PNG) + [`src/components/ui/logo.tsx`](src/components/ui/logo.tsx) |
| Logo de co-marca (socio/escuela) en el footer | `partnerLogo` en `brand.ts` + [`src/components/site/site-footer.tsx`](src/components/site/site-footer.tsx) |
| Favicon (pestaña del navegador) | [`src/app/icon.svg`](src/app/icon.svg) |
| Tipografía | [`src/app/layout.tsx`](src/app/layout.tsx) + `--font-*` en `globals.css` |
| Qué marca muestra un despliegue | variable de entorno `NEXT_PUBLIC_BRAND` |

> **Ojo:** los **colores de las 4 dimensiones** (en
> [`src/lib/questionnaire.ts`](src/lib/questionnaire.ts)) y la **tipografía**
> (Roboto) son **globales**, no por marca. Si necesitas que cambien por marca,
> mira la sección "Limitaciones conocidas".

---

## 2. Marcas actuales

Definidas en `src/lib/brand.ts` (`BRANDS`):

| Clave | Nombre | Entidad legal | Logo | Co-branding |
|-------|--------|---------------|------|-------------|
| `semaforo` | Semáforo Digital | Semáforo Digital | semáforo (3 luces) | — |
| `utb` | Semáforo Digital UTB | Universidad Tecnológica de Bolívar | logo UTB (`/utb-logo.svg`) | Escuela de Transformación Digital (`/escuela-td-logo.png`) |

Colores por marca (en `globals.css`):

| | Primario | Acento |
|--|----------|--------|
| `semaforo` (default `@theme`) | teal `#0e7490` | indigo `#4f46e5` |
| `utb` (`[data-brand="utb"]`) | navy `#003087` | teal `#14b8a6` |

---

## 3. Cambiar QUÉ marca se muestra (UTB ↔ Semáforo)

La marca activa la decide `NEXT_PUBLIC_BRAND`. **Importante:** es una variable
**de build-time** (Next.js la "hornea" al construir), no de runtime. Esto cambia
cómo se configura según el entorno:

### Local (tu máquina)
Crea o edita **`.env.local`** en la raíz del proyecto:
```bash
NEXT_PUBLIC_BRAND=semaforo   # o "utb", o la clave que sea
```
Reinicia el dev server (`npm run dev`). Listo.

### Producción en el VPS (Docker)
⚠️ **No basta con ponerla en `.env.production`**, porque:
- el `.dockerignore` excluye `.env*` del build, y
- `NEXT_PUBLIC_*` se inyecta al **construir la imagen**, no al ejecutar el contenedor.

Hay que pasarla como **build ARG**. Edita el `Dockerfile` (stage `builder`, antes
de `npm run build`):
```dockerfile
ARG NEXT_PUBLIC_BRAND=utb
ENV NEXT_PUBLIC_BRAND=$NEXT_PUBLIC_BRAND
```
Y en `docker-compose.yml` del despliegue:
```yaml
services:
  app:
    build:
      context: .
      args:
        NEXT_PUBLIC_BRAND: semaforo   # la marca de ESTE despliegue
```
Luego reconstruye:
```bash
docker compose up -d --build
```

> **Variables runtime vs build-time:** `DATABASE_URL`, `ADMIN_PASSWORD`, etc. son
> runtime → van en `.env.production` y se aplican al reiniciar. `NEXT_PUBLIC_*`
> es build-time → requiere rebuild (y el ARG de arriba).

---

## 4. Modificar una marca existente

### 4.1 Textos (nombre, entidad, dominio)
En `src/lib/brand.ts`, edita el preset:
```ts
utb: {
  name: "Semáforo Digital UTB",                       // títulos, metadata
  legalEntity: "Universidad Tecnológica de Bolívar",  // footer, términos, privacidad
  domain: "semaforodigital.online",                   // metadataBase / Open Graph
  description: "…",                                   // SEO
  logo: "utb",
  partnerLogo: "/escuela-td-logo.png",
  partnerName: "Escuela de Transformación Digital",
},
```

### 4.2 Colores
En `src/app/globals.css`, edita el bloque de la marca:
```css
[data-brand="utb"] {
  --color-primary: #003087;          /* botones, títulos, acentos, logo */
  --color-primary-foreground: #ffffff;
  --color-accent: #14b8a6;           /* detalles secundarios */
  --color-accent-foreground: #ffffff;
}
```
> Tailwind v4 lee estas variables, así que cambiar el hex **re-tiñe todo el
> sitio** (botones, `text-gradient`, glows). Un solo lugar.
>
> El fondo blanco se mantiene porque NO se sobrescribe `--color-background`.

### 4.3 Logo
- **Logo tipo `utb`** (imagen): reemplaza `public/utb-logo.svg` (mismo nombre).
- **Logo tipo `semaforo`** (semáforo de 3 luces): es un componente SVG en
  `src/components/ui/logo.tsx`.

### 4.4 Co-branding (logo socio en el footer)
Pon el archivo en `public/` y referencia en el preset:
```ts
partnerLogo: "/escuela-td-logo.png",
partnerName: "Escuela de Transformación Digital",
```
Si el preset **no** tiene `partnerLogo`, el footer no muestra co-marca.

### 4.5 Favicon
Reemplaza `src/app/icon.svg`. Next lo usa automáticamente como ícono de la
pestaña. (Los navegadores cachean el favicon: haz hard-refresh ⌘⇧R para verlo.)

---

## 5. Crear una marca NUEVA (otra universidad/cliente)

Ejemplo: marca `acme`.

**Paso 1 — Preset** en `src/lib/brand.ts`:
```ts
// 1a. agrega la clave al tipo
export type BrandKey = "semaforo" | "utb" | "acme";

// 1b. agrega el preset al objeto BRANDS
acme: {
  key: "acme",
  name: "Semáforo Digital · ACME",
  shortName: "Semáforo ACME",
  legalEntity: "ACME S.A.S.",
  domain: "acme.com",
  description: "…",
  logo: "acme",                 // ver paso 3
  partnerLogo: "/acme-partner.png",   // opcional
  partnerName: "Aliado ACME",         // opcional
},
```

**Paso 2 — Colores** en `src/app/globals.css`:
```css
[data-brand="acme"] {
  --color-primary: #RRGGBB;
  --color-primary-foreground: #ffffff;
  --color-accent: #RRGGBB;
  --color-accent-foreground: #ffffff;
}
```

**Paso 3 — Logo** en `src/components/ui/logo.tsx` (función `LogoLockup`):
```tsx
if (BRAND.logo === "acme") {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/acme-logo.svg" alt={BRAND.legalEntity} className={cn("h-11 w-auto", className)} />
  );
}
```
Y agrega `"acme"` al tipo del campo `logo` en la interfaz `Brand` (`brand.ts`):
```ts
logo: "semaforo" | "utb" | "acme";
```
Pon el archivo `public/acme-logo.svg`.

**Paso 4 — Favicon (opcional):** si quieres favicon propio por marca, hoy
`icon.svg` es único; ver "Limitaciones conocidas".

**Paso 5 — Desplegar** con `NEXT_PUBLIC_BRAND=acme` (ver sección 3).

✅ El resto (textos, metadata, footer, títulos) se adapta solo porque todo lee
`BRAND`.

---

## 6. Cómo funciona por dentro (resumen técnico)

1. `brand.ts` resuelve `BRAND` según `NEXT_PUBLIC_BRAND` (default `utb`).
2. `layout.tsx` pone `data-brand={BRAND.key}` en `<html>` → activa el bloque de
   colores correcto en `globals.css`.
3. Los componentes importan `BRAND` para textos/logo; los colores salen solos por
   las variables CSS (`bg-primary`, `text-primary`, etc.).
4. Cada despliegue construye su imagen con su marca (build-time).

---

## 7. Limitaciones conocidas

- **Colores de dimensiones**: hoy son globales (`questionnaire.ts`), iguales para
  todas las marcas (paleta navy/teal de UTB). Para que cambien por marca habría
  que moverlos a un preset por marca.
- **Tipografía**: global (Roboto). Para fuente por marca habría que parametrizar
  `layout.tsx`/`globals.css`.
- **Favicon**: único (`icon.svg`). Para favicon por marca se necesitaría lógica
  adicional (ej. ruta de ícono por marca).
- **`NEXT_PUBLIC_BRAND` es build-time**: cambiar la marca en el VPS requiere
  rebuild (no basta reiniciar). Si prefieres cambiar de marca solo editando
  `.env.production` + reiniciar, se puede refactorizar a una variable **runtime**
  (leerla en el servidor y pasarla a los componentes cliente vía un provider).
