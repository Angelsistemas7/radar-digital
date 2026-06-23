"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { ShineOverlay } from "@/components/ui/shine";
import { Semaforo, useSemaforoCycle, WASH } from "@/components/ui/semaforo";
import { QUESTIONNAIRE } from "@/lib/questionnaire";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Hero() {
  const { index, color } = useSemaforoCycle();
  const level = QUESTIONNAIRE.maturityLevels[index];

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" />
      <div className="pointer-events-none absolute inset-0 bg-radial-fade" />

      {/* ambient color wash — gently follows the semáforo's current color */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute right-[6%] top-[8%] size-[36rem] rounded-full blur-3xl"
          animate={{ backgroundColor: WASH[index] }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 left-[-10%] size-[34rem] rounded-full blur-3xl"
          animate={{ backgroundColor: WASH[index] }}
          transition={{ duration: 1.4, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 pb-24 pt-16 md:grid-cols-2 md:pt-24">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05, ease: EASE }}
            className="relative mt-5 overflow-hidden text-pretty text-5xl font-extrabold leading-[1.03] tracking-tight sm:text-6xl lg:text-[4.25rem]"
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
            <ShineOverlay delay={5} />
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: EASE }}
            className="mt-6 max-w-md text-lg leading-relaxed text-muted"
          >
            Responde con un semáforo y al instante conoce el nivel de madurez
            digital de tu empresa, área por área, con la claridad de un semáforo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/diagnostico" className={cn(buttonClasses("primary", "lg"), "relative overflow-hidden")}>
              Iniciar autodiagnóstico <ArrowRight className="size-5" />
              <ShineOverlay delay={3} />
            </Link>
            <a href="#dimensiones" className={buttonClasses("secondary", "lg")}>
              Ver dimensiones
            </a>
          </motion.div>

        </div>

        {/* Semáforo visual — anima de rojo a amarillo a verde */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          className="relative mx-auto w-full max-w-md"
        >
          <motion.div
            className="pointer-events-none absolute -inset-8 rounded-[2.5rem] blur-3xl"
            animate={{ backgroundColor: WASH[index] }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          />
          <div className="glass glow-primary relative rounded-3xl p-6 sm:p-8">
            <div className="mb-6">
              <p className="text-sm font-semibold text-foreground">
                Tu semáforo digital
              </p>
            </div>
            <div className="flex justify-center py-3 sm:py-4">
              <Semaforo active={index} color={color} size="xl" />
            </div>
            <motion.p
              className="mt-6 text-center text-lg font-bold transition-colors"
              animate={{ color }}
              transition={{ duration: 0.8 }}
            >
              Nivel {level.name}
            </motion.p>
            <p className="text-center text-sm text-muted">{level.tagline}</p>
          </div>

          {/* floating level pill — reflects the live state */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65, ease: EASE }}
            className="absolute -right-3 -top-3 hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold shadow-lg sm:flex"
          >
            <motion.span animate={{ color }} transition={{ duration: 0.8 }} className="inline-flex items-center gap-1.5">
              <BadgeCheck className="size-3.5" /> Nivel {level.name}
            </motion.span>
          </motion.div>
        </motion.div>
      </div>
      {/* fade al fondo de la página para suavizar el corte con la sección siguiente */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
