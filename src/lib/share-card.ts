import { formatScore } from "./utils";
import type { AssessmentResult } from "./types";

/* ============================================================
   Share card — a 1080×1080 PNG summary of the result, ready to
   share on WhatsApp / LinkedIn. Drawn on a <canvas> (no deps),
   fully client-side and offline. Uses the Web Share API when
   available (mobile) and falls back to a download.
   ============================================================ */

const SITE = "radar-digital-three.vercel.app";
const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";

/** Truncate text with an ellipsis so it fits within maxW (uses current ctx.font). */
function clip(ctx: CanvasRenderingContext2D, text: string, maxW: number): string {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

/** Draw the radar polygon from the dimension scores, centered at (cx, cy). */
function drawRadar(
  ctx: CanvasRenderingContext2D,
  result: AssessmentResult,
  cx: number,
  cy: number,
  r: number,
): void {
  const dims = result.dimensions;
  const n = dims.length;
  const max = 10;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number): [number, number] => {
    const rad = (Math.min(Math.max(v, 0), max) / max) * r;
    const a = ang(i);
    return [cx + rad * Math.cos(a), cy + rad * Math.sin(a)];
  };

  // concentric rings
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = "rgba(233,238,251,0.12)";
  [0.25, 0.5, 0.75, 1].forEach((ring) => {
    ctx.beginPath();
    dims.forEach((_, i) => {
      const [x, y] = pt(i, ring * max);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();
  });

  // axes + axis labels
  ctx.textBaseline = "middle";
  ctx.font = `500 22px ${SANS}`;
  dims.forEach((d, i) => {
    const [ex, ey] = pt(i, max);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ex, ey);
    ctx.strokeStyle = "rgba(233,238,251,0.10)";
    ctx.lineWidth = 1;
    ctx.stroke();
    const a = ang(i);
    const lx = cx + (r + 32) * Math.cos(a);
    const ly = cy + (r + 32) * Math.sin(a);
    ctx.fillStyle = "rgba(233,238,251,0.72)";
    ctx.textAlign = Math.cos(a) > 0.3 ? "left" : Math.cos(a) < -0.3 ? "right" : "center";
    ctx.fillText(d.name, lx, ly);
  });

  // data polygon
  ctx.beginPath();
  dims.forEach((d, i) => {
    const [x, y] = pt(i, d.score);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.closePath();
  const fill = ctx.createRadialGradient(cx, cy, 10, cx, cy, r);
  fill.addColorStop(0, "rgba(34,211,238,0.5)");
  fill.addColorStop(1, "rgba(139,92,246,0.22)");
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "#22d3ee";
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.stroke();

  // vertices, colored per dimension
  dims.forEach((d, i) => {
    const [x, y] = pt(i, d.score);
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  });
}

/** Render the full card and return it as a PNG Blob. */
async function buildCard(result: AssessmentResult, company?: string): Promise<Blob> {
  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");

  // background + ambient glow
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, "#0c1426");
  bg.addColorStop(1, "#080d18");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);
  const glow = ctx.createRadialGradient(S / 2, 700, 30, S / 2, 700, 520);
  glow.addColorStop(0, "rgba(34,211,238,0.20)");
  glow.addColorStop(1, "rgba(34,211,238,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // header
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "left";
  ctx.fillStyle = "#22d3ee";
  ctx.font = `700 30px ${SANS}`;
  ctx.fillText("RADAR DIGITAL", 80, 100);
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(233,238,251,0.5)";
  ctx.font = `400 24px ${SANS}`;
  ctx.fillText(SITE, S - 80, 98);

  // company
  ctx.textAlign = "left";
  if (company) {
    ctx.fillStyle = "rgba(233,238,251,0.85)";
    ctx.font = `500 32px ${SANS}`;
    ctx.fillText(clip(ctx, company, S - 160), 80, 178);
  }

  // level + big score
  ctx.fillStyle = "#ffffff";
  ctx.font = `700 50px ${SANS}`;
  ctx.fillText("Nivel " + result.level.name, 80, 252);

  const scoreTxt = formatScore(result.overall);
  ctx.fillStyle = result.level.color;
  ctx.font = `700 128px ${SANS}`;
  ctx.fillText(scoreTxt, 80, 388);
  const sw = ctx.measureText(scoreTxt).width;
  ctx.fillStyle = "rgba(233,238,251,0.45)";
  ctx.font = `400 44px ${SANS}`;
  ctx.fillText("/ 10", 80 + sw + 18, 388);

  ctx.fillStyle = result.level.color;
  ctx.font = `500 26px ${SANS}`;
  ctx.fillText(result.level.tagline, 84, 430);

  // radar
  drawRadar(ctx, result, S / 2, 705, 248);

  // footer caption
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(233,238,251,0.55)";
  ctx.font = `400 24px ${SANS}`;
  ctx.fillText(
    `Diagnóstico de madurez digital · ${result.dimensions.length} dimensiones`,
    S / 2,
    1032,
  );

  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo generar la imagen"))),
      "image/png",
    ),
  );
}

/** Build the card and share it (or download it as a fallback). */
export async function shareResultCard(
  result: AssessmentResult,
  company?: string,
): Promise<void> {
  const blob = await buildCard(result, company);
  const file = new File([blob], "radar-digital.png", { type: "image/png" });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title: "Mi madurez digital",
        text: `Mi nivel: ${result.level.name} (${formatScore(result.overall)}/10) — Radar Digital`,
      });
      return;
    } catch (e) {
      // User cancelled the share sheet — don't also trigger a download.
      if (e instanceof Error && e.name === "AbortError") return;
    }
  }

  // Fallback: download the PNG.
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "radar-digital.png";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
