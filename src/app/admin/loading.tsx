export default function AdminLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3">
      <span className="size-8 animate-spin rounded-full border-4 border-border border-t-primary" />
      <p className="text-sm text-muted">Cargando panel…</p>
    </div>
  );
}
