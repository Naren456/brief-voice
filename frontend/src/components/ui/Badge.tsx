import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-xs rounded font-mono text-label-sm uppercase tracking-wider px-2 py-0.5 select-none",
  {
    variants: {
      variant: {
        neutral: "bg-surface-container-highest text-on-surface-variant",
        primary: "bg-primary/10 text-primary",
        success: "bg-tertiary-container/30 text-tertiary",
        warning: "bg-error-container/20 text-error",
        ai: "bg-secondary-container/30 text-secondary",
        outline: "border border-outline-variant text-on-surface-variant",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
