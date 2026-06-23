/**
 * Limpia la hoja de Google Sheets y escribe el encabezado correcto.
 * Solo usa módulos nativos de Node — no requiere npm install.
 *
 * Uso en VPS (dentro del contenedor):
 *   docker compose cp scripts/reset-sheet.mjs app:/app/reset-sheet.mjs
 *   docker compose exec app node reset-sheet.mjs
 */

import { createSign } from "node:crypto";
import { request } from "node:https";
import { URLSearchParams } from "node:url";

const sheetId = process.env.RADAR_SHEET_ID;
const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

if (!sheetId || !raw) {
  console.error("Faltan variables: RADAR_SHEET_ID y/o GOOGLE_SERVICE_ACCOUNT_JSON");
  process.exit(1);
}

const sa = JSON.parse(raw);

// ── HTTP helpers ─────────────────────────────────────────────────────────────
function httpsCall(method, hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname, path, method, headers };
    const req = request(opts, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── JWT / OAuth2 ─────────────────────────────────────────────────────────────
const now = Math.floor(Date.now() / 1000);
const jwtHeader = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
const jwtPayload = Buffer.from(JSON.stringify({
  iss: sa.client_email,
  scope: "https://www.googleapis.com/auth/spreadsheets",
  aud: "https://oauth2.googleapis.com/token",
  exp: now + 3600,
  iat: now,
})).toString("base64url");

const sign = createSign("RSA-SHA256");
sign.update(`${jwtHeader}.${jwtPayload}`);
const jwt = `${jwtHeader}.${jwtPayload}.${sign.sign(sa.private_key, "base64url")}`;

const tokenBody = new URLSearchParams({
  grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
  assertion: jwt,
}).toString();

const tokenResp = await httpsCall(
  "POST", "oauth2.googleapis.com", "/token",
  { "Content-Type": "application/x-www-form-urlencoded", "Content-Length": Buffer.byteLength(tokenBody) },
  tokenBody,
);

if (!tokenResp.body?.access_token) {
  console.error("Error obteniendo token:", JSON.stringify(tokenResp.body));
  process.exit(1);
}
const auth = { Authorization: `Bearer ${tokenResp.body.access_token}` };

// ── 1. Limpiar toda la hoja ───────────────────────────────────────────────────
const clearResp = await httpsCall(
  "POST", "sheets.googleapis.com",
  `/v4/spreadsheets/${sheetId}/values/A%3AZ:clear`,
  { ...auth, "Content-Length": "0" },
  null,
);
if (clearResp.status !== 200) {
  console.error("Error al limpiar:", clearResp.status, JSON.stringify(clearResp.body));
  process.exit(1);
}
console.log("✓ Hoja limpiada");

// ── 2. Escribir encabezado en A1 ──────────────────────────────────────────────
const HEADER = [
  "Fecha", "Empresa", "Nombre completo", "Cargo", "Correo electrónico",
  "Teléfono", "Ciudad", "País", "Sector", "Nivel educativo",
  "Puntaje total", "Nivel", "Estrategia", "Cultura", "Cliente", "Procesos",
];
const updateBody = JSON.stringify({ values: [HEADER] });
const updateResp = await httpsCall(
  "PUT", "sheets.googleapis.com",
  `/v4/spreadsheets/${sheetId}/values/A1?valueInputOption=RAW`,
  { ...auth, "Content-Type": "application/json", "Content-Length": Buffer.byteLength(updateBody) },
  updateBody,
);
if (updateResp.status !== 200) {
  console.error("Error al escribir encabezado:", updateResp.status, JSON.stringify(updateResp.body));
  process.exit(1);
}
console.log("✓ Encabezado escrito:", HEADER.join(" | "));
