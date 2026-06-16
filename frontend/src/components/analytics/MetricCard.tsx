import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  delta?: { value: number; positive?: boolean };
  icon: LucideIcon;
  tone?: "primary" | "secondary" | "tertiary";
  children?: React.ReactNode;
  className?: string;
}

const TONE_MAP: Record<string, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-tertiary/10 text-tertiary",
};

export function MetricCard({
  label,
  value,
  unit,
  delta,
  icon: Icon,
  tone = "primary",
  children,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col justify-between transition-colors hover:border-outline",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("p-2 rounded-lg", TONE_MAP[tone])}>
          <Icon className="w-4 h-4" />
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-xs font-mono text-label-sm uppercase tracking-wider",
              delta.positive !== false ? "text-tertiary" : "text-error",
            )}
          >
            <TrendingUp className="w-3 h-3" />
            {delta.positive !== false ? "+" : ""}
            {delta.value.toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-xl">
        <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <h3 className="font-geist font-semibold text-display-lg text-on-surface mt-xs leading-none">
          {value}
          {unit && (
            <span className="font-geist text-headline-md font-normal text-on-surface-variant ml-1">
              {unit}
            </span>
          )}
        </h3>
      </div>
      {children}
    </div>
  );
}
