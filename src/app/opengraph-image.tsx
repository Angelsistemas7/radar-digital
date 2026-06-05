import { ImageResponse } from "next/og";

export const alt = "Radar Digital — Diagnóstico de Madurez Digital";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "84px",
          background:
            "linear-gradient(135deg, #0b1220 0%, #0e7490 62%, #4f46e5 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 30,
            letterSpacing: 2,
            opacity: 0.92,
          }}
        >
          <div
            style={{ width: 20, height: 20, borderRadius: 10, background: "#22d3ee" }}
          />
          RADAR DIGITAL
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 800,
            marginTop: 26,
            lineHeight: 1.05,
            maxWidth: 940,
          }}
        >
          Mide la madurez digital de tu empresa
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 33,
            marginTop: 26,
            opacity: 0.85,
            maxWidth: 860,
          }}
        >
          Diagnóstico en 8 dimensiones + plan de acción personalizado
        </div>

        <div style={{ display: "flex", gap: 14, marginTop: 46 }}>
          {["Estrategia", "Datos", "Cliente", "Ciberseguridad"].map((t) => (
            <div
              key={t}
              style={{
                display: "flex",
                fontSize: 24,
                padding: "10px 24px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.28)",
              }}
            >
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
