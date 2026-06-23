import { cn } from "@/lib/utils";

/** Semáforo Digital brand mark — a traffic light with red/amber/green lamps. */
export function Logo({
  size = 36,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      role="img"
      aria-label="Semáforo Digital"
    >
      {/* housing — dark slate so it reads on both light and dark themes */}
      <rect x="14" y="2" width="20" height="44" rx="10" fill="#1e293b" />
      <rect
        x="14"
        y="2"
        width="20"
        height="44"
        rx="10"
        fill="none"
        stroke="#475569"
        strokeWidth="0.8"
      />
      {/* lamps — slightly smaller so they don't crowd the housing */}
      <circle cx="24" cy="12.8" r="5" fill="#ef4444" />
      <circle cx="24" cy="24" r="5" fill="#f59e0b" />
      <circle cx="24" cy="35.2" r="5" fill="#22c55e" />
      {/* gloss highlights */}
      <circle cx="22.3" cy="11.1" r="1.5" fill="#ffffff" opacity="0.55" />
      <circle cx="22.3" cy="22.3" r="1.5" fill="#ffffff" opacity="0.5" />
      <circle cx="22.3" cy="33.5" r="1.5" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}

/** Logo + wordmark lockup for headers. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={32} />
      <span className="font-display text-lg font-bold tracking-tight">
        Semáforo<span className="text-gradient"> Digital</span>
      </span>
    </span>
  );
}
