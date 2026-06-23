import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import { MotionProvider } from "@/components/motion-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://semaforodigital.online"),
  title: {
    default: "Semáforo Digital — Diagnóstico de Madurez Digital",
    template: "%s · Semáforo Digital",
  },
  description:
    "Mide la madurez digital de tu empresa en 4 dimensiones y recibe un plan de acción personalizado para impulsar tu transformación digital.",
  applicationName: "Semáforo Digital",
  keywords: [
    "madurez digital",
    "transformación digital",
    "diagnóstico empresarial",
    "Semáforo Digital",
  ],
  authors: [{ name: "Semáforo Digital" }],
  openGraph: {
    title: "Semáforo Digital — Diagnóstico de Madurez Digital",
    description:
      "Descubre las fortalezas y debilidades digitales de tu empresa con un diagnóstico de 4 dimensiones.",
    siteName: "Semáforo Digital",
    url: "https://semaforodigital.online",
    type: "website",
    locale: "es_CO",
  },
  twitter: {
    card: "summary_large_image",
    title: "Semáforo Digital — Diagnóstico de Madurez Digital",
    description:
      "Mide la madurez digital de tu empresa en 4 dimensiones y recibe un plan de acción.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f6f7f9",
};

// Set the theme before paint to avoid a flash of the wrong theme.
const themeScript = `(function(){try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
