import { jsPDF } from "jspdf";
import { generateDiagnosis } from "./diagnosis";
import type { AssessmentResult } from "./types";

/* ============================================================
   Radar Digital — Professional PDF report (vector, auto-download).
   Built programmatically with jsPDF (no html2canvas) so the output
   is crisp and deterministic.
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

const INK: RGB = [11, 16, 32];
const MUTED: RGB = [90, 104, 133];
const SOFT: RGB = [60, 70, 90];
const LINE: RGB = [222, 228, 238];
const PRIMARY: RGB = [14, 116, 144];

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

  const tc = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const fc = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const dc = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);

  const polygon = (pts: number[][], style: string) => {
    if (pts.length < 2) return;
    const segs = pts.slice(1).map((p, i) => [p[0] - pts[i][0], p[1] - pts[i][1]]);
    doc.lines(segs, pts[0][0], pts[0][1], [1, 1], style, true);
  };

  /* ---------------- Page 1 ---------------- */

  // Header band
  fc(INK);
  doc.rect(0, 0, W, 70, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Radar Digital", M, 34);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(180, 190, 210);
  doc.text("Diagnóstico de Madurez Digital", M, 50);
  doc.text(
    new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    W - M,
    34,
    { align: "right" },
  );

  // Company / sector
  let y = 96;
  tc(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(company || "Tu empresa", M, y);
  if (sector) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    tc(MUTED);
    doc.text(`Sector: ${sector}`, M, y + 15);
  }

  // Overall score box
  y = 120;
  dc(LINE);
  doc.setLineWidth(1);
  doc.roundedRect(M, y, W - 2 * M, 76, 8, 8, "S");
  const lvl = hex(result.level.color);
  tc(lvl);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(result.overall.toFixed(1).replace(".", ","), M + 24, y + 48);
  doc.setFontSize(11);
  tc(MUTED);
  doc.text("/ 10", M + 92, y + 48);
  tc(INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(`Nivel ${result.level.name}`, M + 150, y + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  tc(MUTED);
  doc.text(doc.splitTextToSize(result.level.description, W - 2 * M - 170), M + 150, y + 44);

  // Radar
  y = 224;
  const cx = M + 130;
  const cy = y + 110;
  const R = 96;
  const dims = result.dimensions;
  const n = dims.length;
  const ang = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n;
  const pt = (i: number, v: number): number[] => {
    const r = (Math.min(Math.max(v, 0), 10) / 10) * R;
    return [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  };

  dc([210, 216, 228]);
  doc.setLineWidth(0.5);
  [0.25, 0.5, 0.75, 1].forEach((ring) =>
    polygon(dims.map((_, i) => pt(i, ring * 10)), "S"),
  );
  dims.forEach((_, i) => {
    const p = pt(i, 10);
    doc.line(cx, cy, p[0], p[1]);
  });
  const dpts = dims.map((d, i) => pt(i, d.score));
  fc([34, 211, 238]);
  const g = doc as unknown as {
    saveGraphicsState?: () => void;
    restoreGraphicsState?: () => void;
    GState?: new (o: { opacity: number }) => unknown;
    setGState?: (s: unknown) => void;
  };
  try {
    if (g.saveGraphicsState && g.GState && g.setGState) {
      g.saveGraphicsState();
      g.setGState(new g.GState({ opacity: 0.25 }));
      polygon(dpts, "F");
      g.restoreGraphicsState?.();
    } else {
      polygon(dpts, "F");
    }
  } catch {
    polygon(dpts, "F");
  }
  dc(PRIMARY);
  doc.setLineWidth(1.2);
  polygon(dpts, "S");
  fc(PRIMARY);
  dpts.forEach((p) => doc.circle(p[0], p[1], 1.8, "F"));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  tc(MUTED);
  dims.forEach((d, i) => {
    const a = ang(i);
    const lx = cx + (R + 14) * Math.cos(a);
    const ly = cy + (R + 14) * Math.sin(a);
    const align = Math.cos(a) > 0.3 ? "left" : Math.cos(a) < -0.3 ? "right" : "center";
    doc.text(d.name, lx, ly + 2, { align });
  });

  // Dimension bars (right column)
  const colX = M + 270;
  const colW = W - M - colX;
  let by = y + 18;
  [...dims]
    .sort((a, b) => b.score - a.score)
    .forEach((d) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      tc(INK);
      doc.text(d.name, colX, by + 7);
      const barX = colX + 92;
      const barW = colW - 122;
      fc([235, 238, 244]);
      doc.roundedRect(barX, by, barW, 7, 3, 3, "F");
      fc(hex(d.color));
      doc.roundedRect(barX, by, Math.max(2, (barW * d.score) / 10), 7, 3, 3, "F");
      doc.setFont("helvetica", "bold");
      tc(hex(d.color));
      doc.text(d.score.toFixed(1), colX + colW, by + 7, { align: "right" });
      by += 22;
    });

  // Footer note p1
  tc(MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Generado por Radar Digital · Datos tratados conforme a la Ley 1581 de 2012 (Habeas Data).",
    M,
    H - 28,
  );

  /* ---------------- Page 2: diagnosis + plan ---------------- */
  doc.addPage();
  let y2 = 50;
  const ensure = (need: number) => {
    if (y2 > H - need) {
      doc.addPage();
      y2 = 50;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  tc(INK);
  doc.text("Diagnóstico", M, y2);
  y2 += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  tc(SOFT);
  const sum = doc.splitTextToSize(diag.summary, W - 2 * M);
  doc.text(sum, M, y2);
  y2 += sum.length * 12 + 12;

  diag.perDimension.forEach((pd) => {
    ensure(90);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    tc(hex(pd.color));
    doc.text(`${pd.name}  —  ${pd.score.toFixed(1)}/10`, M, y2);
    y2 += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    tc(SOFT);
    pd.recommendations.forEach((r) => {
      const lines = doc.splitTextToSize(`-  ${r}`, W - 2 * M - 10);
      ensure(40);
      doc.text(lines, M + 8, y2);
      y2 += lines.length * 11;
    });
    y2 += 8;
  });

  ensure(140);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  tc(INK);
  doc.text("Plan de acción", M, y2);
  y2 += 18;

  diag.plan.forEach((phase) => {
    ensure(80);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11.5);
    tc(PRIMARY);
    doc.text(`${phase.label}  ·  ${phase.focus}`, M, y2);
    y2 += 15;
    phase.items.forEach((item) => {
      ensure(50);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      tc(INK);
      doc.text(
        `${item.dimensionName}  (${item.score.toFixed(1)} -> ${item.target.toFixed(1)})  [prioridad ${item.priority}]`,
        M + 6,
        y2,
      );
      y2 += 12;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.8);
      tc(SOFT);
      item.actions.forEach((a) => {
        const lines = doc.splitTextToSize(`-  ${a}`, W - 2 * M - 16);
        ensure(36);
        doc.text(lines, M + 14, y2);
        y2 += lines.length * 10.5;
      });
      y2 += 5;
    });
    y2 += 8;
  });

  const slug = (company || "reporte")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  doc.save(`Radar-Digital-${slug || "reporte"}.pdf`);
}
