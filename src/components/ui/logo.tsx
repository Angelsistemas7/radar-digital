import { cn } from "@/lib/utils";

/** Radar Digital brand mark — concentric radar with a sweep and a blip. */
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
      aria-label="Radar Digital"
    >
      <defs>
        <linearGradient
          id="rdLogo"
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient
          id="rdSweep"
          x1="24"
          y1="24"
          x2="38"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#22d3ee" stopOpacity="0.45" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="20" stroke="url(#rdLogo)" strokeOpacity="0.3" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="13" stroke="url(#rdLogo)" strokeOpacity="0.45" strokeWidth="1.4" />
      <circle cx="24" cy="24" r="6" stroke="url(#rdLogo)" strokeOpacity="0.7" strokeWidth="1.4" />
      <line x1="4" y1="24" x2="44" y2="24" stroke="url(#rdLogo)" strokeOpacity="0.16" strokeWidth="1" />
      <line x1="24" y1="4" x2="24" y2="44" stroke="url(#rdLogo)" strokeOpacity="0.16" strokeWidth="1" />
      <path d="M24 24 L24 4 A20 20 0 0 1 41.3 14 Z" fill="url(#rdSweep)" />
      <line x1="24" y1="24" x2="24" y2="4" stroke="#22d3ee" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="33" cy="15" r="2.6" fill="#22d3ee" />
    </svg>
  );
}

/** Logo + wordmark lockup for headers. */
export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={32} />
      <span className="font-display text-lg font-bold tracking-tight">
        Radar<span className="text-gradient"> Digital</span>
      </span>
    </span>
  );
}
