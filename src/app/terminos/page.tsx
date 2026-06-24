import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";
import { BRAND } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Términos de uso",
  description: `Términos y condiciones de uso de ${BRAND.name}.`,
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-2 text-xl font-bold tracking-tight">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 leading-relaxed text-muted">{children}</p>;
}

export default function TerminosPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Términos de uso
        </h1>

        <H2>1. Objeto</H2>
        <P>
          {BRAND.name} es una herramienta para autoevaluar la madurez digital de
          un emprendimiento o empresa y obtener un diagnóstico y un plan de acción
          orientativo.
        </P>

        <H2>2. Naturaleza orientativa</H2>
        <P>
          Los resultados, recomendaciones y planes de acción tienen carácter
          informativo y orientativo. No constituyen asesoría profesional,
          financiera ni legal vinculante. Las decisiones que tomes con base en el
          diagnóstico son de tu exclusiva responsabilidad.
        </P>

        <H2>3. Uso adecuado</H2>
        <P>
          Te comprometes a proporcionar información veraz y a no usar la plataforma
          con fines fraudulentos, automatizados o que afecten su funcionamiento o
          el de otros usuarios.
        </P>

        <H2>4. Asistente con IA</H2>
        <P>
          El asesor con inteligencia artificial genera respuestas automáticas que
          pueden contener imprecisiones. Verifica la información relevante antes de
          actuar sobre ella.
        </P>

        <H2>5. Propiedad y datos</H2>
        <P>
          El tratamiento de tus datos personales se rige por nuestra{" "}
          <a className="text-primary underline" href="/privacidad">
            Política de Tratamiento de Datos
          </a>
          .
        </P>

        <H2>6. Cambios</H2>
        <P>
          Podemos actualizar estos términos en cualquier momento; la versión
          vigente será la publicada en esta página.
        </P>
      </main>
      <SiteFooter />
    </>
  );
}
