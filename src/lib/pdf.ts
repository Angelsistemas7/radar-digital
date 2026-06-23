import { jsPDF } from "jspdf";
import { generateDiagnosis } from "./diagnosis";
import { QUESTIONNAIRE } from "./questionnaire";
import { levelForScore } from "./scoring";
import { scoreColor } from "./utils";
import type { AssessmentResult } from "./types";

/* ============================================================
   Radar Digital — "Semáforo Digital" PDF report.
   Qualitative (no numeric scores): a big traffic light whose lit
   lamp reflects the overall state, plus one card per area colored
   by its own state. Built programmatically with jsPDF.
   ============================================================ */

type RGB = [number, number, number];

function hex(h: string): RGB {
  const s = h.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

/** Blend two colors: t=0 -> a, t=1 -> b. */
function mix(a: RGB, b: RGB, t: number): RGB {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/** jsPDF's standard fonts only support Latin-1 (cp1252). Replace the few
 *  Unicode chars our content uses and strip anything else, so a stray "→"
 *  doesn't garble the whole line. */
function clean(s: string): string {
  return s
    .replace(/→/g, "->") // →
    .replace(/[—–]/g, "-") // — –
    .replace(/•/g, "-") // •
    .replace(/[‘’]/g, "'") // ‘ ’
    .replace(/[“”]/g, '"') // “ ”
    .replace(/…/g, "...") // …
    // eslint-disable-next-line no-control-regex
    .replace(/[^ -ÿ]/g, "");
}

const INK: RGB = [11, 16, 32];
const MUTED: RGB = [90, 104, 133];
const SOFT: RGB = [60, 70, 90];
const LINE: RGB = [222, 228, 238];
const PANEL: RGB = [249, 250, 252];
const PRIMARY: RGB = [14, 116, 144];
const HOUSING: RGB = [11, 18, 32]; // matches the on-screen traffic light (#0b1220)
// Base color of each lamp position (red / amber / green).
const LAMP_BASE: RGB[] = [
  [239, 68, 68],
  [245, 158, 11],
  [34, 197, 94],
];

/** Traffic-light lamp index for a 0-10 score (0 red, 1 amber, 2 green). */
const lampIndex = (score: number) => (score < 6.1 ? 0 : score < 9.1 ? 1 : 2);

export function downloadReport(
  result: AssessmentResult,
  company?: string,
  sector?: string,
) {
  const diag = generateDiagnosis(result, { company: company ?? "" });
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 40;
  const dateStr = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const lvl = hex(result.level.color);

  const tc = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const fc = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const dc = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const text = (
    s: string,
    x: number,
    y: number,
    opts?: { align?: "left" | "center" | "right" },
  ) => doc.text(clean(s), x, y, opts);

  /** A big traffic-light lamp, mirroring the on-screen BigTrafficLight:
   *  a lit lamp glows (halo) with a soft white highlight toward the
   *  upper-left; an off lamp is a faint tint of its own position color. */
  const bigLamp = (cx: number, cy: number, r: number, on: boolean, color: RGB) => {
    if (on) {
      fc(mix(HOUSING, color, 0.45)); // outer glow halo
      doc.circle(cx, cy, r * 1.55, "F");
      fc(mix(HOUSING, color, 0.78)); // inner glow
      doc.circle(cx, cy, r * 1.22, "F");
    }
    // Every lamp shows its full color (like the on-screen traffic light);
    // only the active one additionally gets the glow halo above.
    fc(color);
    doc.circle(cx, cy, r, "F");
    fc(mix(color, [255, 255, 255], on ? 0.34 : 0.24)); // glossy radial highlight
    doc.circle(cx - r * 0.12, cy - r * 0.18, r * 0.6, "F");
    if (on) {
      fc(mix(color, [255, 255, 255], 0.6));
      doc.circle(cx - r * 0.2, cy - r * 0.26, r * 0.3, "F");
    }
  };

  /** A small solid indicator dot with a gloss highlight (area cards). */
  const dot = (cx: number, cy: number, r: number, color: RGB) => {
    fc(color);
    doc.circle(cx, cy, r, "F");
    fc(mix(color, [255, 255, 255], 0.45));
    doc.circle(cx - r * 0.28, cy - r * 0.3, r * 0.3, "F");
  };

  const stateName = (score: number) => levelForScore(score).name;

  /* ---------------- Page 1 ---------------- */

  // header band
  fc(INK);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  text("Semáforo Digital", M, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 190, 210);
  text("Semáforo de Madurez Digital", M, 50);
  text(dateStr, W - M, 34, { align: "right" });

  // accent strip in the level color
  fc(lvl);
  doc.rect(0, 70, W, 4, "F");

  // company + sector
  let y = 100;
  tc(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  text(company || "Tu empresa", M, y);
  if (sector) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    tc(MUTED);
    text(`Sector: ${sector}`, W - M, y, { align: "right" });
  }

  // hero: big traffic light + level (qualitative — no number)
  y = 116;
  const heroH = 206;
  fc(PANEL);
  dc(LINE);
  doc.setLineWidth(1);
  doc.roundedRect(M, y, W - 2 * M, heroH, 14, 14, "FD");
  fc(lvl);
  doc.roundedRect(M, y, 5, heroH, 2, 2, "F");

  // traffic-light housing with three lamps; the active one is lit (gradual color)
  const tlW = 78;
  const tlH = 182;
  const tlX = M + 30;
  const tlY = y + (heroH - tlH) / 2;
  fc(HOUSING);
  doc.roundedRect(tlX, tlY, tlW, tlH, 24, 24, "F");
  dc(mix(HOUSING, [255, 255, 255], 0.12)); // subtle border, like the on-screen one
  doc.setLineWidth(0.8);
  doc.roundedRect(tlX, tlY, tlW, tlH, 24, 24, "S");
  const lampCX = tlX + tlW / 2;
  const lampR = 22;
  const lampYs = [tlY + 36, tlY + 91, tlY + 146];
  const activeIdx = lampIndex(result.overall);
  const onColor = hex(scoreColor(result.overall));
  lampYs.forEach((ly, i) =>
    bigLamp(lampCX, ly, lampR, i === activeIdx, i === activeIdx ? onColor : LAMP_BASE[i]),
  );

  // level text to the right of the housing
  const tx = tlX + tlW + 30;
  tc(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  text(`Nivel ${result.level.name}`, tx, y + 86);
  tc(lvl);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  text(result.level.tagline.toUpperCase(), tx, y + 102);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  tc(MUTED);
  doc.text(
    doc.splitTextToSize(clean(result.level.description), W - tx - M - 12),
    tx,
    y + 120,
  );

  // the three states (legend) — current one highlighted
  y += heroH + 26;
  doc.setFontSize(9);
  let lxp = M;
  QUESTIONNAIRE.maturityLevels.forEach((s) => {
    const cur = s.id === result.level.id;
    fc(cur ? hex(s.color) : [205, 210, 220]);
    doc.circle(lxp + 4, y - 3, 4, "F");
    doc.setFont("helvetica", cur ? "bold" : "normal");
    tc(cur ? INK : MUTED);
    text(s.name, lxp + 13, y);
    lxp += 13 + doc.getTextWidth(clean(s.name)) + 24;
  });

  // section: one card per area, each colored by its own state
  y += 28;
  tc(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  text("Tu semáforo por área", M, y);

  y += 14;
  const gap = 16;
  const cardW = (W - 2 * M - gap) / 2;
  const cardH = 58;
  result.dimensions.forEach((d, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cardX = M + col * (cardW + gap);
    const cardY = y + row * (cardH + 14);
    fc(PANEL);
    dc(LINE);
    doc.setLineWidth(0.8);
    doc.roundedRect(cardX, cardY, cardW, cardH, 10, 10, "FD");
    const dCol = hex(scoreColor(d.score));
    dot(cardX + 26, cardY + cardH / 2, 8, dCol);
    tc(INK);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    text(d.name, cardX + 50, cardY + 25);
    tc(dCol);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    text(stateName(d.score), cardX + 50, cardY + 41);
  });
  y += 2 * cardH + 14 + 26;

  // qualitative highlight chips (no scores)
  const half = (W - 2 * M - 14) / 2;
  const qchip = (x: number, tag: string, name: string, c: RGB) => {
    fc(PANEL);
    dc(LINE);
    doc.setLineWidth(0.8);
    doc.roundedRect(x, y, half, 32, 8, 8, "FD");
    fc(c);
    doc.circle(x + 16, y + 16, 3.6, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    tc(MUTED);
    text(tag, x + 28, y + 13);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    tc(INK);
    text(name, x + 28, y + 25);
  };
  const strong = result.strengths[0];
  const weak = result.weaknesses[0];
  if (strong) qchip(M, "Área más fuerte", strong.name, [22, 163, 74]);
  if (weak) qchip(M + half + 14, "Qué reforzar", weak.name, [220, 38, 38]);

  /* ---------------- Page 2: diagnosis + plan ---------------- */
  doc.addPage();
  let y2 = 56;
  const ensure = (need: number) => {
    if (y2 > H - need) {
      doc.addPage();
      y2 = 56;
    }
  };
  // section heading with an underline rule
  const sectionTitle = (label: string) => {
    ensure(60);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    tc(INK);
    text(label, M, y2);
    dc(lvl);
    doc.setLineWidth(2);
    doc.line(M, y2 + 6, M + 34, y2 + 6);
    y2 += 22;
  };

  sectionTitle("Diagnóstico");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  tc(SOFT);
  const sum = doc.splitTextToSize(clean(diag.summary), W - 2 * M);
  doc.text(sum, M, y2);
  y2 += sum.length * 12 + 14;

  diag.perDimension.forEach((pd) => {
    ensure(90);
    fc(hex(pd.color));
    doc.circle(M + 3, y2 - 3, 3, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    tc(hex(pd.color));
    text(`${pd.name}   ·   ${stateName(pd.score)}`, M + 12, y2);
    y2 += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    tc(SOFT);
    pd.recommendations.forEach((r) => {
      const lines = doc.splitTextToSize(clean(`-  ${r}`), W - 2 * M - 10);
      ensure(40);
      doc.text(lines, M + 12, y2);
      y2 += lines.length * 11;
    });
    y2 += 10;
  });

  ensure(140);
  sectionTitle("Plan de acción");

  diag.plan.forEach((phase) => {
    ensure(80);
    fc(PRIMARY);
    doc.roundedRect(M, y2 - 10, 4, 14, 1, 1, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    tc(PRIMARY);
    text(`${phase.label}  ·  ${phase.focus}`, M + 12, y2);
    y2 += 16;
    phase.items.forEach((item) => {
      ensure(50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      tc(INK);
      text(`${item.dimensionName}  ·  prioridad ${item.priority}`, M + 12, y2);
      y2 += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      tc(SOFT);
      item.actions.forEach((a) => {
        const lines = doc.splitTextToSize(clean(`-  ${a}`), W - 2 * M - 22);
        ensure(36);
        doc.text(lines, M + 20, y2);
        y2 += lines.length * 10.5;
      });
      y2 += 6;
    });
    y2 += 10;
  });

  // footer with page numbers on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    dc(LINE);
    doc.setLineWidth(0.5);
    doc.line(M, H - 34, W - M, H - 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    tc(MUTED);
    text(
      `Semáforo Digital · ${dateStr} · Ley 1581 de 2012 (Habeas Data)`,
      M,
      H - 20,
    );
    text(`${p} / ${pages}`, W - M, H - 20, { align: "right" });
  }

  const slug = (company || "reporte")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  doc.save(`Semaforo-Digital-${slug || "reporte"}.pdf`);
}
