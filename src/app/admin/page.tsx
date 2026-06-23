import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Users,
  Gauge,
  Trophy,
  Globe2,
  Home,
  TriangleAlert,
  Database,
  Layers,
  Handshake,
} from "lucide-react";
import { LogoLockup } from "@/components/ui/logo";
import { LogoutButton } from "@/components/admin/logout-button";
import { AdminAutoLogout } from "@/components/admin/auto-logout";
import { Semaforo } from "@/components/ui/semaforo";
import {
  LevelDistributionChart,
  TimelineChart,
  CountryChart,
  SectorChart,
} from "@/components/admin/admin-charts";
import { SubmissionsTable } from "@/components/admin/submissions-table";
import {
  listSubmissions,
  summarize,
  isDemoMode,
  type SubmissionRow,
} from "@/lib/submissions";
import { verifySessionToken, ADMIN_COOKIE } from "@/lib/admin-auth";
import { formatScore } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Panel administrador",
  robots: { index: false, follow: false },
};

function Kpi({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="glass card-hover rounded-2xl p-5">
      <div className="flex items-center gap-2.5">
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon className="size-5" />
        </span>
        <p className="text-xs font-medium leading-tight text-muted">{label}</p>
      </div>
      <p className="mt-3.5 font-display text-[26px] font-bold leading-none tracking-tight tabular-nums">
        {value}
      </p>
    </div>
  );
}

export default async function AdminPage() {
  // Defense in depth: proxy guards too, but verify here as well.
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!verifySessionToken(token)) redirect("/admin/login");

  const configured = !isDemoMode();
  let rows: SubmissionRow[] = [];
  let dbError: string | null = null;
  try {
    rows = await listSubmissions();
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Error desconocido";
  }

  const summary = summarize(rows);

  return (
    <>
      <AdminAutoLogout />
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Semáforo Digital — inicio">
              <LogoLockup />
            </Link>
            <span className="hidden rounded-full bg-elevated px-2.5 py-1 text-xs text-muted sm:inline">
              Panel administrador
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-foreground sm:flex"
            >
              <Home className="size-4" /> Sitio
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">
              Resumen de diagnósticos
            </h1>
            <p className="text-sm text-muted">
              Datos agregados de todas las empresas que han completado el test.
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              configured
                ? "border-success/30 bg-success/10 text-success"
                : "border-warning/30 bg-warning/10 text-warning"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${configured ? "bg-success" : "bg-warning"}`}
            />
            {configured ? "Datos en vivo" : "Datos de ejemplo"} · {summary.total}{" "}
            {summary.total === 1 ? "registro" : "registros"}
          </span>
        </div>

        {!configured && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm">
            <Database className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-primary">Mostrando datos de ejemplo</p>
              <p className="text-muted">
                Conecta Supabase (define <code className="text-foreground">SUPABASE_URL</code>{" "}
                y <code className="text-foreground">SUPABASE_SERVICE_ROLE_KEY</code> en{" "}
                <code className="text-foreground">.env.local</code> y ejecuta{" "}
                <code className="text-foreground">supabase/schema.sql</code>) para ver
                las respuestas reales.
              </p>
            </div>
          </div>
        )}

        {dbError && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm">
            <TriangleAlert className="mt-0.5 size-5 shrink-0 text-danger" />
            <div>
              <p className="font-semibold text-danger">Error al leer la base de datos</p>
              <p className="text-muted">{dbError}</p>
            </div>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          <Kpi icon={Users} label="Empresas evaluadas" value={String(summary.total)} accent="#22d3ee" />
          <Kpi
            icon={Gauge}
            label="Madurez promedio"
            value={`${formatScore(summary.avgOverall)} / 10`}
            accent="#8b5cf6"
          />
          <Kpi
            icon={Trophy}
            label="Nivel más común"
            value={summary.topLevel?.name ?? "—"}
            accent={summary.topLevel?.color ?? "#34d399"}
          />
          <Kpi
            icon={Handshake}
            label="Interesados en contacto"
            value={String(summary.leads)}
            accent="#10b981"
          />
          <Kpi
            icon={Globe2}
            label="Países"
            value={String(summary.byCountry.length)}
            accent="#fbbf24"
          />
        </div>

        {/* Semáforos por dimensión + level distribution */}
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Semáforo promedio por dimensión</h2>
            {summary.total > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
                {summary.dimensionAverages.map((d) => (
                  <div key={d.dimensionId} className="flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-surface/40 p-3">
                    <Semaforo score={d.avg} size="sm" />
                    <p className="text-center text-xs font-semibold leading-tight text-foreground/90">{d.name}</p>
                    <p className="text-xs font-bold tabular-nums" style={{ color: d.color }}>{d.avg.toFixed(1)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Distribución por nivel</h2>
            {summary.total > 0 ? (
              <LevelDistributionChart data={summary.levelDistribution} />
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        {/* Timeline + countries */}
        <div className="mt-4 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Diagnósticos en el tiempo</h2>
            {summary.timeline.length > 0 ? (
              <TimelineChart data={summary.timeline} />
            ) : (
              <EmptyChart />
            )}
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 text-lg font-semibold">Por país</h2>
            {summary.byCountry.length > 0 ? (
              <CountryChart data={summary.byCountry} />
            ) : (
              <EmptyChart />
            )}
          </div>
        </div>

        {/* Sector benchmarking */}
        <div className="glass mt-4 rounded-3xl p-6">
          <div className="mb-1 flex items-center gap-2">
            <Layers className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Benchmarking por sector</h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            Madurez digital promedio (0–10) de las empresas, agrupadas por sector.
          </p>
          {summary.bySector.length > 0 ? (
            <SectorChart data={summary.bySector} />
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Table */}
        <div className="mt-4">
          <SubmissionsTable rows={rows} />
        </div>
      </main>
    </>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[240px] items-center justify-center text-sm text-faint">
      Aún no hay datos suficientes.
    </div>
  );
}
