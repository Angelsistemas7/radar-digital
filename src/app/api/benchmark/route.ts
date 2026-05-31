import { type NextRequest } from "next/server";
import { listSubmissions, type SubmissionRow } from "@/lib/submissions";
import { QUESTIONNAIRE } from "@/lib/questionnaire";
import { round1 } from "@/lib/utils";

export const runtime = "nodejs";

/** Sector benchmark: average score per dimension for a given sector.
 *  Falls back to the overall average when the sector has < 3 records. */
export async function GET(req: NextRequest) {
  const sector = new URL(req.url).searchParams.get("sector")?.trim() ?? "";

  let rows: SubmissionRow[];
  try {
    rows = await listSubmissions();
  } catch {
    rows = [];
  }

  const inSector = sector ? rows.filter((r) => r.sector === sector) : [];
  const base = inSector.length >= 3 ? inSector : rows;

  const dimensions = QUESTIONNAIRE.dimensions.map((d) => {
    const vals = base.map(
      (r) => r.dimensions?.find((x) => x.dimensionId === d.id)?.score ?? 0,
    );
    const avg = vals.length
      ? round1(vals.reduce((a, b) => a + b, 0) / vals.length)
      : 0;
    return { dimensionId: d.id, name: d.name, color: d.color, avg };
  });

  const overall = dimensions.length
    ? round1(dimensions.reduce((a, d) => a + d.avg, 0) / dimensions.length)
    : 0;

  return Response.json(
    {
      sector,
      count: inSector.length,
      basedOnAll: inSector.length < 3,
      overall,
      dimensions,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
