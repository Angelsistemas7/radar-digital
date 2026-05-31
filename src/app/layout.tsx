import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Sora } from "next/font/google";
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
  metadataBase: new URL("https://radar-digital.app"),
  title: {
    default: "Radar Digital — Diagnóstico de Madurez Digital",
    template: "%s · Radar Digital",
  },
  description:
    "Mide la madurez digital de tu empresa en 8 dimensiones y recibe un plan de acción personalizado para impulsar tu transformación digital.",
  applicationName: "Radar Digital",
  keywords: [
    "madurez digital",
    "transformación digital",
    "diagnóstico empresarial",
    "Radar Digital",
  ],
  authors: [{ name: "Radar Digital" }],
  openGraph: {
    title: "Radar Digital — Diagnóstico de Madurez Digital",
    description:
      "Descubre las fortalezas y debilidades digitales de tu empresa con un radar de 8 dimensiones.",
    type: "website",
    locale: "es_CO",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#070a12",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
