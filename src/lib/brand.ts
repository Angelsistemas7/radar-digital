/**
 * White-label: configuración de marca centralizada.
 *
 * Una sola base de código sirve varias marcas. Cada marca es un preset aquí.
 * La marca activa se elige con `NEXT_PUBLIC_BRAND` (se "hornea" en el build,
 * así que cada despliegue construye su imagen con su marca).
 *
 * Por ahora UTB comparte el despliegue de semaforodigital.online, así que el
 * default es "utb". Para separar el sitio público luego, define
 * `NEXT_PUBLIC_BRAND=semaforo` en el entorno de ese despliegue — sin tocar código.
 */

export type BrandKey = "semaforo" | "utb";

export interface Brand {
  key: BrandKey;
  /** Nombre completo para copys, títulos y metadata. */
  name: string;
  /** Nombre corto para espacios reducidos. */
  shortName: string;
  /** Entidad legal para footer, términos y privacidad. */
  legalEntity: string;
  /** Dominio de producción (metadataBase / Open Graph). */
  domain: string;
  /** Descripción SEO. */
  description: string;
  /** Tipo de logo a renderizar en el lockup. */
  logo: "semaforo" | "utb";
  /** Logo de co-marca opcional (socio/escuela) — se muestra en el footer. */
  partnerLogo?: string;
  /** Nombre del co-branding (texto alternativo del logo). */
  partnerName?: string;
}

export const BRANDS: Record<BrandKey, Brand> = {
  semaforo: {
    key: "semaforo",
    name: "Semáforo Digital",
    shortName: "Semáforo Digital",
    legalEntity: "Semáforo Digital",
    domain: "semaforodigital.online",
    description:
      "Mide la madurez digital de tu empresa en 4 dimensiones y recibe un plan de acción personalizado para impulsar tu transformación digital.",
    logo: "semaforo",
  },
  utb: {
    key: "utb",
    name: "Semáforo Digital UTB",
    shortName: "Semáforo UTB",
    legalEntity: "Universidad Tecnológica de Bolívar",
    domain: "semaforodigital.online",
    description:
      "Mide la madurez digital de tu empresa en 4 dimensiones y recibe un plan de acción para impulsar tu transformación digital.",
    logo: "utb",
    partnerLogo: "/escuela-td-logo.png",
    partnerName: "Escuela de Transformación Digital",
  },
};

const envBrand = process.env.NEXT_PUBLIC_BRAND as BrandKey | undefined;

/** Clave de la marca activa para este despliegue. */
export const ACTIVE_BRAND_KEY: BrandKey =
  envBrand && BRANDS[envBrand] ? envBrand : "utb";

/** Marca activa — úsala en componentes y metadata. */
export const BRAND: Brand = BRANDS[ACTIVE_BRAND_KEY];
