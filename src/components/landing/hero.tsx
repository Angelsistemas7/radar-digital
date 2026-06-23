"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Clock, Sparkles, BadgeCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Semaforo } from "@/components/ui/semaforo";
import { levelForScore } from "@/lib/scoring";

const SAMPLE_SCORE = 6.5;
const SAMPLE_LEVEL = levelForScore(SAMPLE_SCORE);

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-elevated/60 px-3 py-1.5 text-xs font-medium text-muted"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary/60" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
            Diagnóstico gratuito · 4 áreas
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="mt-5 text-pretty text-5xl font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]"
          >
            Mide la{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-gradient">madurez digital</span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-1 z-0 h-3.5 rounded-sm bg-primary/20 sm:h-4"
              />
            </span>{" "}
            de tu empresa
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
          >
            Responde con un semáforo —sí, más o menos o no— y obtén al instante
            tu semáforo digital con tus fortalezas, tus áreas de mejora y un
            plan de acción concreto para tu transformación digital.
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

        {/* Semáforo visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="relative mx-auto w-full max-w-md"
        >
          <div className="pointer-events-none absolute -inset-8 rounded-[2.5rem] bg-primary/10 blur-3xl" />
          <div className="glass glow-primary relative rounded-3xl p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Tu semáforo digital
              </p>
              <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                Ejemplo
              </span>
            </div>
            <div className="flex justify-center py-4">
              <Semaforo score={SAMPLE_SCORE} size="lg" />
            </div>
            <p
              className="mt-6 text-center text-lg font-bold"
              style={{ color: SAMPLE_LEVEL.color }}
            >
              Nivel {SAMPLE_LEVEL.name}
            </p>
            <p className="text-center text-sm text-muted">{SAMPLE_LEVEL.tagline}</p>
          </div>

          {/* floating level pill */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
            className="absolute -right-3 -top-3 hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-lg sm:flex"
            style={{ color: SAMPLE_LEVEL.color }}
          >
            <BadgeCheck className="size-3.5" /> Nivel {SAMPLE_LEVEL.name}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
