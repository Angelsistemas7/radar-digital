import { google } from "googleapis";
import type { Respondent } from "./types";

function getSheetsClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(raw),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export interface SheetRow {
  respondent: Respondent;
  overall: number;
  levelName: string;
  dimensions: { name: string; score: number }[];
}

export async function appendToSheet(row: SheetRow): Promise<void> {
  const sheetId = process.env.RADAR_SHEET_ID;
  if (!sheetId) return;

  const sheets = getSheetsClient();
  if (!sheets) return;

  const ahora = new Date().toLocaleString("es-CO", {
    timeZone: "America/Bogota",
    dateStyle: "short",
    timeStyle: "short",
  });

  const dimScores = row.dimensions.map((d) =>
    String(d.score).replace(".", ","),
  );

  await sheets.spreadsheets.values.append({
    spreadsheetId: sheetId,
    range: "A:Z",
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: {
      values: [[
        ahora,
        row.respondent.company,
        row.respondent.fullName,
        row.respondent.role,
        row.respondent.email,
        row.respondent.phone,
        row.respondent.city,
        row.respondent.country,
        row.respondent.sector,
        String(row.overall).replace(".", ","),
        row.levelName,
        ...dimScores,
      ]],
    },
  });
}
