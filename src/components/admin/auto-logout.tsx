"use client";

import { useEffect, useRef } from "react";

/**
 * Logs the admin out after a period of inactivity, and also when the user
 * returns to a tab that has been hidden longer than the idle window.
 * Server-side the cookie is a sliding session token; this is the visible,
 * client-side half so the panel actually closes itself.
 */
const IDLE_MS = 30 * 60 * 1000; // 30 minutes

export function AdminAutoLogout() {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActive = useRef<number>(Date.now());

  useEffect(() => {
    const logout = async () => {
      try {
        await fetch("/api/admin/logout", { method: "POST" });
      } catch {
        /* ignore — we redirect regardless */
      }
      window.location.href = "/admin/login?expired=1";
    };

    const reset = () => {
      lastActive.current = Date.now();
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(logout, IDLE_MS);
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        if (Date.now() - lastActive.current >= IDLE_MS) logout();
        else reset();
      }
    };

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) =>
      window.addEventListener(e, reset, { passive: true }),
    );
    document.addEventListener("visibilitychange", onVisible);
    reset();

    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return null;
}
