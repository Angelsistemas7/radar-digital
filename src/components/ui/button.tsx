import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90",
  secondary:
    "bg-elevated text-foreground border border-border-strong hover:border-faint",
  ghost: "text-muted hover:text-foreground hover:bg-elevated/60",
  danger:
    "bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-lg",
  md: "h-11 px-6 text-sm rounded-xl",
  lg: "h-14 px-8 text-base rounded-2xl",
};

const BASE =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer";

/** Shared classes so <Link> can look like a <Button>. */
export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
