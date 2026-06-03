"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock, Sparkles, BadgeCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { RadarChart } from "@/components/results/radar-chart";
import { DIMENSIONS } from "@/lib/questionnaire";

const SAMPLE = DIMENSIONS.map((d, i) => ({
  label: d.name,
  color: d.color,
  value: [7.6, 5.1, 8.3, 4.2, 6.7, 5.6, 7.2, 4.0][i] ?? 6,
}));

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-elevated/60 px-3 py-1.5 text-xs font-medium text-muted"
          >
            <Sparkles className="size-3.5 text-primary" />
            Diagnóstico gratuito · 8 dimensiones
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Mide la <span className="text-gradient">madurez digital</span> de tu
            empresa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="mt-5 max-w-md text-lg text-muted"
          >
            Responde un cuestionario inteligente y obtén un radar con tus
            fortalezas, tus debilidades y un plan de acción para impulsar tu
            transformación digital.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/diagnostico" className={buttonClasses("primary", "lg")}>
              Iniciar diagnóstico <ArrowRight className="size-5" />
            </Link>
            <a href="#dimensiones" className={buttonClasses("secondary", "lg")}>
              Ver dimensiones
            </a>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-faint"
          >
            <li className="inline-flex items-center gap-1.5">
              <Clock className="size-4 text-primary" /> ~5 minutos
            </li>
            <li className="inline-flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-primary" /> Resultado inmediato
            </li>
            <li className="inline-flex items-center gap-1.5">
              <Sparkles className="size-4 text-primary" /> Plan personalizado
            </li>
          </motion.ul>
        </div>

        {/* Radar visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-primary/5 blur-2xl" />
          <div className="glass glow-primary relative rounded-3xl p-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Tu radar digital
              </p>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                Ejemplo
              </span>
            </div>
            <RadarChart data={SAMPLE} showLabels size={340} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
