import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

/* ============================================================
   Radar Digital — Input validation
   Single source of truth shared by the client form (react-hook-form)
   and the server API route. Includes anti-gibberish heuristics so
   "asasas" style junk is rejected.
   ============================================================ */

export const GENDERS = [
  "Hombre",
  "Mujer",
  "No binario",
  "Prefiero no responder",
] as const;

export const COUNTRIES = [
  "Colombia",
  "México",
  "Argentina",
  "Chile",
  "Perú",
  "Ecuador",
  "Venezuela",
  "Bolivia",
  "Paraguay",
  "Uruguay",
  "Brasil",
  "Costa Rica",
  "Panamá",
  "Guatemala",
  "Honduras",
  "El Salvador",
  "Nicaragua",
  "República Dominicana",
  "Cuba",
  "Puerto Rico",
  "España",
  "Estados Unidos",
  "Otro",
] as const;

export const SECTORS = [
  "Comercio / Retail",
  "Alimentos y bebidas",
  "Tecnología / Software",
  "Servicios profesionales",
  "Salud y bienestar",
  "Educación",
  "Manufactura / Industria",
  "Agroindustria",
  "Turismo y hotelería",
  "Construcción",
  "Finanzas / Fintech",
  "Logística y transporte",
  "Moda y textil",
  "Arte, cultura y creatividad",
  "Energía y sostenibilidad",
  "Otro",
] as const;

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "yopmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "temp-mail.org",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "dispostable.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwawaymail.com",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const KEYBOARD_RUNS = [
  "qwerty",
  "qwert",
  "asdf",
  "asdfg",
  "zxcv",
  "zxcvb",
  "hjkl",
  "12345",
  "123456",
  "098765",
  "poiuy",
];

/**
 * Heuristic detector for junk text like "asasas", "aaaa", "asdf".
 * Returns true when the value looks like gibberish.
 */
export function looksLikeGibberish(raw: string): boolean {
  const s = raw.trim().toLowerCase();
  if (s.length < 3) return true;

  const letters = (s.match(/\p{L}/gu) ?? []).length;
  if (letters < 2) return true;

  // No vowels at all (Spanish words have them).
  if (!/[aeiouáéíóúü]/i.test(s)) return true;

  // Same character 4+ times in a row: "aaaa".
  if (/(.)\1{3,}/.test(s)) return true;

  // Short repeated pattern: "asasas", "lalala", "jojojo".
  const compact = s.replace(/\s+/g, "");
  // Single distinct character ("aa", "aaaa").
  if (new Set(compact).size <= 1) return true;
  if (/^(.{1,3}?)\1{2,}$/.test(compact)) return true;

  // Too few distinct characters for its length.
  if (compact.length >= 5 && new Set(compact).size <= 2) return true;

  // Keyboard mashing.
  if (KEYBOARD_RUNS.some((run) => s.includes(run))) return true;

  // Very low vowel ratio in a longish token.
  const vowels = (s.match(/[aeiouáéíóúü]/gi) ?? []).length;
  if (letters >= 6 && vowels / letters < 0.18) return true;

  return false;
}

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return DISPOSABLE_DOMAINS.has(domain);
}

const realText = (min: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, label)
    .max(120, "Máximo 120 caracteres")
    .refine((v) => !looksLikeGibberish(v), "Por favor escribe un valor real");

export const respondentSchema = z.object({
  company: realText(2, "Escribe el nombre del emprendimiento"),
  fullName: realText(3, "Escribe tu nombre completo").refine(
    (v) => v.trim().split(/\s+/).length >= 2,
    "Incluye al menos nombre y apellido",
  ),
  role: realText(2, "Indica tu cargo o rol"),
  gender: z
    .string()
    .refine((v) => (GENDERS as readonly string[]).includes(v), "Selecciona una opción"),
  email: z
    .string()
    .trim()
    .min(5, "Escribe tu correo electrónico")
    .max(120)
    .refine((v) => EMAIL_RE.test(v), "Correo electrónico no válido")
    .refine((v) => !isDisposableEmail(v), "Usa un correo real, no temporal"),
  phone: z
    .string()
    .trim()
    .min(7, "Escribe tu número de teléfono")
    .refine((v) => {
      try {
        return isValidPhoneNumber(v);
      } catch {
        return false;
      }
    }, "Teléfono no válido. Incluye el indicativo, ej. +57 300 123 4567"),
  city: realText(2, "Indica tu ciudad"),
  country: z
    .string()
    .refine((v) => (COUNTRIES as readonly string[]).includes(v), "Selecciona tu país"),
  sector: z
    .string()
    .refine((v) => (SECTORS as readonly string[]).includes(v), "Selecciona tu sector"),
  consent: z
    .boolean()
    .refine((v) => v === true, "Necesitamos tu autorización para continuar"),
});

export type RespondentInput = z.infer<typeof respondentSchema>;

export const emptyRespondent: RespondentInput = {
  company: "",
  fullName: "",
  role: "",
  gender: "",
  email: "",
  phone: "",
  city: "",
  country: "Colombia",
  sector: "",
  consent: false,
};
