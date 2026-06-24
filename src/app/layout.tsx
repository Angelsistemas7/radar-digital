import type { Metadata, Viewport } from "next";
import { Geist_Mono, Roboto } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import { ScrollRestorationFix } from "@/components/scroll-restoration-fix";
import { BRAND } from "@/lib/brand";
import "./globals.css";

// Roboto — tipografía institucional de UTB (utb.edu.co). Se usa tanto para
// cuerpo como para titulares; el mono se mantiene para etiquetas pequeñas.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(`https://${BRAND.domain}`),
  title: {
    default: `${BRAND.name} — Diagnóstico de Madurez Digital`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: [
    "madurez digital",
    "transformación digital",
    "diagnóstico empresarial",
    BRAND.name,
  ],
  authors: [{ name: BRAND.legalEntity }],
  openGraph: {
    title: `${BRAND.name} — Diagnóstico de Madurez Digital`,
    description:
      "Descubre las fortalezas y debilidades digitales de tu empresa con un diagnóstico de 4 dimensiones.",
    siteName: BRAND.name,
    url: `https://${BRAND.domain}`,
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name} — Diagnóstico de Madurez Digital`,
    description:
      "Mide la madurez digital de tu empresa en 4 dimensiones y recibe un plan de acción.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f6f7f9",
};

// Modo claro por defecto en todo el sitio. Limpiamos cualquier preferencia
// oscura antigua para que nadie quede atrapado en el tema oscuro (se quitó).
const themeScript = `(function(){try{localStorage.removeItem('theme');document.documentElement.classList.remove('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-brand={BRAND.key}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${roboto.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <ScrollRestorationFix />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
