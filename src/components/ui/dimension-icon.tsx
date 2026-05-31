import {
  Target,
  Users,
  HeartHandshake,
  Workflow,
  Server,
  Database,
  Rocket,
  ShieldCheck,
  Sparkles,
  type LucideProps,
} from "lucide-react";
import type { ComponentType } from "react";

const ICONS: Record<string, ComponentType<LucideProps>> = {
  Target,
  Users,
  HeartHandshake,
  Workflow,
  Server,
  Database,
  Rocket,
  ShieldCheck,
};

/** Renders a Lucide icon by the name stored in the questionnaire config. */
export function DimensionIcon({
  name,
  ...props
}: { name: string } & LucideProps) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon {...props} />;
}
