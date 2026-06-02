import type { Metadata } from "next";
import { SiteHeader } from "@/components/site/site-header";
import { SiteFooter } from "@/components/site/site-footer";

export const metadata: Metadata = {
  title: "Política de Tratamiento de Datos Personales",
  description:
    "Política de privacidad y tratamiento de datos personales de Radar Digital, conforme a la Ley 1581 de 2012 (Colombia).",
};

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "privacidad@radardigital.co";

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-8 mb-2 text-xl font-bold tracking-tight">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 leading-relaxed text-muted">{children}</p>;
}

export default function PrivacidadPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
          Legal
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Política de Tratamiento de Datos Personales
        </h1>
        <p className="mt-3 text-sm text-faint">
          Conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013 (Colombia).
        </p>

        <H2>1. Responsable del tratamiento</H2>
        <P>
          Radar Digital es responsable del tratamiento de los datos personales
          recolectados a través de este sitio. Para cualquier solicitud
          relacionada con tus datos, escríbenos a{" "}
          <a className="text-primary underline" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>
          .
        </P>

        <H2>2. Datos que recolectamos</H2>
        <P>
          Al realizar el diagnóstico recolectamos: nombre del emprendimiento,
          nombre completo, cargo, género, correo electrónico, número de teléfono,
          ciudad, país, sector y las respuestas del cuestionario. No recolectamos
          datos sensibles ni información de menores de edad.
        </P>

        <H2>3. Finalidad del tratamiento</H2>
        <P>
          Usamos tus datos para: (i) calcular y entregarte tu diagnóstico de
          madurez digital; (ii) identificar y dar seguimiento a tu emprendimiento;
          (iii) generar estadísticas agregadas y comparativas por sector; y (iv)
          contactarte, si lo autorizas, para acompañamiento. Las estadísticas
          agregadas no permiten identificarte individualmente.
        </P>

        <H2>4. Tus derechos como titular</H2>
        <P>
          Como titular de los datos tienes derecho a: conocer, actualizar y
          rectificar tus datos; solicitar prueba de la autorización otorgada; ser
          informado sobre el uso de tus datos; presentar quejas ante la
          Superintendencia de Industria y Comercio (SIC); revocar la autorización
          y/o solicitar la supresión de tus datos cuando no exista un deber legal
          de conservarlos; y acceder de forma gratuita a tus datos.
        </P>

        <H2>5. Cómo ejercer tus derechos</H2>
        <P>
          Para consultar, actualizar, rectificar o solicitar la eliminación de tus
          datos, envía tu solicitud a{" "}
          <a className="text-primary underline" href={`mailto:${CONTACT}`}>
            {CONTACT}
          </a>{" "}
          indicando tu nombre, el correo con el que participaste y tu petición.
          Atenderemos las consultas en un máximo de 10 días hábiles y los reclamos
          en un máximo de 15 días hábiles, conforme a la ley.
        </P>

        <H2>6. Conservación y seguridad</H2>
        <P>
          Conservamos tus datos mientras sean necesarios para las finalidades
          descritas o mientras exista una obligación legal. Aplicamos medidas
          técnicas y administrativas razonables (cifrado en tránsito, control de
          acceso y almacenamiento seguro) para proteger tu información frente a
          accesos no autorizados.
        </P>

        <H2>7. Autorización</H2>
        <P>
          Al marcar la casilla de consentimiento y completar el diagnóstico,
          autorizas de manera previa, expresa e informada el tratamiento de tus
          datos personales según esta política.
        </P>

        <H2>8. Vigencia y cambios</H2>
        <P>
          Esta política rige a partir de su publicación y puede actualizarse.
          Publicaremos cualquier cambio en esta misma página.
        </P>
      </main>
      <SiteFooter />
    </>
  );
}
