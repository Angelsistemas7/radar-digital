"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Semaforo, LAMP_COLORS } from "@/components/ui/semaforo";
import {
  respondentSchema,
  type RespondentInput,
  emptyRespondent,
  GENDERS,
  COUNTRIES,
  SECTORS,
  EDUCATION_LEVELS,
} from "@/lib/validation";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Building2,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Globe,
  Layers,
  GraduationCap,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

const inputCls =
  "w-full rounded-xl border bg-surface/70 px-3.5 py-2.5 text-sm text-foreground placeholder:text-faint outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/20";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs text-danger">
      <AlertCircle className="size-3.5 shrink-0" />
      {msg}
    </p>
  );
}

export function OnboardingForm({
  initial,
  onComplete,
}: {
  initial?: Partial<RespondentInput>;
  onComplete: (data: RespondentInput) => void;
}) {
  const honeypot = useRef<HTMLInputElement>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RespondentInput>({
    resolver: zodResolver(respondentSchema),
    defaultValues: { ...emptyRespondent, ...initial },
    mode: "onTouched",
  });

  // Estado del semáforo: rojo si hay errores, verde si todo válido, ámbar por defecto.
  const stateIdx: 0 | 1 | 2 =
    Object.keys(errors).length > 0 ? 0 : isValid ? 2 : 1;
  const stateColor = LAMP_COLORS[stateIdx];
  // Wash tenue alrededor del formulario (menos intenso que el del home).
  const SOFT_WASH = [
    "rgba(239,68,68,0.16)",
    "rgba(245,158,11,0.10)",
    "rgba(34,197,94,0.16)",
  ] as const;

  return (
    <div className="relative">
      {/* contraste de color alrededor del formulario (fuera del encuadre) */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] blur-3xl sm:-inset-10"
        animate={{ backgroundColor: SOFT_WASH[stateIdx] }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <form
        noValidate
        onSubmit={handleSubmit((data) => {
          if (honeypot.current?.value) return; // bot trap
          onComplete(data);
        })}
        className="relative glass rounded-3xl p-6 sm:p-8"
      >
        {/* semáforo de estado en la esquina superior derecha */}
        <div className="absolute right-4 top-4 sm:right-5 sm:top-5">
          <Semaforo active={stateIdx} color={stateColor} size="xs" />
        </div>

        <div className="mb-6 pr-[76px] sm:pr-24">
          <h2 className="text-2xl font-bold tracking-tight">Antes de comenzar</h2>
          <p className="mt-1.5 text-sm text-muted">
            Cuéntanos quién realiza el diagnóstico. Usaremos estos datos solo para
            identificar y entregar tu resultado.
          </p>
        </div>

      {/* honeypot (hidden from users, catches bots) */}
      <input
        ref={honeypot}
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute left-[-9999px] size-0 opacity-0"
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {/* Company — full width */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <Building2 className="size-4 text-faint" /> Nombre del emprendimiento
          </label>
          <input
            {...register("company")}
            placeholder="Ej. Innova Café S.A.S."
            className={cn(inputCls, errors.company ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          />
          <FieldError msg={errors.company?.message} />
        </div>

        {/* Full name */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <User className="size-4 text-faint" /> Nombre completo
          </label>
          <input
            {...register("fullName")}
            placeholder="Nombres y apellidos"
            className={cn(inputCls, errors.fullName ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          />
          <FieldError msg={errors.fullName?.message} />
        </div>

        {/* Role */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <Briefcase className="size-4 text-faint" /> Cargo o rol
          </label>
          <input
            {...register("role")}
            placeholder="Ej. Fundador / Gerente"
            className={cn(inputCls, errors.role ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          />
          <FieldError msg={errors.role?.message} />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <Mail className="size-4 text-faint" /> Correo electrónico
          </label>
          <input
            {...register("email")}
            type="email"
            inputMode="email"
            placeholder="nombre@empresa.com"
            className={cn(inputCls, errors.email ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          />
          <FieldError msg={errors.email?.message} />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <Phone className="size-4 text-faint" /> Teléfono
          </label>
          <input
            {...register("phone")}
            type="tel"
            inputMode="tel"
            placeholder="300 123 4567"
            className={cn(inputCls, errors.phone ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          />
          <FieldError msg={errors.phone?.message} />
        </div>

        {/* City */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <MapPin className="size-4 text-faint" /> Ciudad
          </label>
          <input
            {...register("city")}
            placeholder="Ej. Bogotá"
            className={cn(inputCls, errors.city ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          />
          <FieldError msg={errors.city?.message} />
        </div>

        {/* Country */}
        <div>
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <Globe className="size-4 text-faint" /> País
          </label>
          <select
            {...register("country")}
            className={cn(inputCls, errors.country ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-surface text-foreground">
                {c}
              </option>
            ))}
          </select>
          <FieldError msg={errors.country?.message} />
        </div>

        {/* Sector — full width (used for benchmarking) */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <Layers className="size-4 text-faint" /> Sector del emprendimiento
          </label>
          <select
            {...register("sector")}
            className={cn(inputCls, errors.sector ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          >
            <option value="" disabled>
              Selecciona tu sector…
            </option>
            {SECTORS.map((s) => (
              <option key={s} value={s} className="bg-surface text-foreground">
                {s}
              </option>
            ))}
          </select>
          {!errors.sector && (
            <p className="mt-1.5 text-xs text-faint">
              Lo usamos para compararte con tu sector (benchmarking).
            </p>
          )}
          <FieldError msg={errors.sector?.message} />
        </div>

        {/* Education level — full width */}
        <div className="sm:col-span-2">
          <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <GraduationCap className="size-4 text-faint" /> Nivel educativo
          </label>
          <select
            {...register("educationLevel")}
            className={cn(inputCls, errors.educationLevel ? "border-danger ring-2 ring-danger/30 shadow-[0_0_0_4px_rgba(220,38,38,0.10)]" : "border-border")}
          >
            <option value="" disabled>
              Selecciona tu nivel educativo…
            </option>
            {EDUCATION_LEVELS.map((e) => (
              <option key={e} value={e} className="bg-surface text-foreground">
                {e}
              </option>
            ))}
          </select>
          <FieldError msg={errors.educationLevel?.message} />
        </div>

        {/* Gender — full width */}
        <div className="sm:col-span-2">
          <label className="mb-2 flex items-center gap-1.5 text-sm font-medium text-foreground/90">
            <User className="size-4 text-faint" /> Género
          </label>
          <div className="flex flex-wrap gap-2">
            {GENDERS.map((g) => (
              <label key={g} className="cursor-pointer">
                <input type="radio" value={g} className="peer sr-only" {...register("gender")} />
                <span className="inline-block rounded-lg border border-border bg-surface/70 px-3.5 py-2 text-sm text-muted transition hover:border-border-strong peer-checked:border-primary peer-checked:bg-primary/10 peer-checked:text-foreground">
                  {g}
                </span>
              </label>
            ))}
          </div>
          <FieldError msg={errors.gender?.message} />
        </div>

        {/* Consent — full width */}
        <div className="sm:col-span-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface/50 p-4">
            <input
              type="checkbox"
              className="mt-0.5 size-4 shrink-0 accent-primary"
              {...register("consent")}
            />
            <span className="text-sm text-muted">
              Autorizo el tratamiento de mis datos personales para la medición de
              madurez digital de mi emprendimiento, conforme a la{" "}
              <a
                href="/privacidad"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-primary underline"
              >
                política de privacidad
              </a>{" "}
              (Ley 1581 de 2012). Podré solicitar su eliminación cuando quiera.
            </span>
          </label>
          <FieldError msg={errors.consent?.message} />
        </div>
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <p className="hidden items-center gap-1.5 text-xs text-faint sm:flex">
          <ShieldCheck className="size-4 text-success" /> Conexión segura · datos
          cifrados
        </p>
        <button type="submit" className={buttonClasses("primary", "lg", "w-full sm:w-auto")}>
          Comenzar el diagnóstico <ArrowRight className="size-5" />
        </button>
      </div>
      </form>
    </div>
  );
}
