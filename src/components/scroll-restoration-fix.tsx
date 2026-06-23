"use client";
import { useEffect } from "react";

/** Evita que el navegador restaure la posición de scroll al hacer refresh. */
export function ScrollRestorationFix() {
  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);
  return null;
}
