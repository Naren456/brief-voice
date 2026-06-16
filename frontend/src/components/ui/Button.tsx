import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-sm whitespace-nowrap rounded-lg font-mono text-label-md tracking-wide transition-all focus-ring disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-on-primary hover:brightness-110 shadow-glow-primary",
        secondary:
          "bg-surface-container text-on-surface border border-outline-variant hover:border-outline hover:bg-surface-container-high",
        ghost:
          "bg-transparent text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface",
        outline:
          "border border-outline-variant text-on-surface hover:bg-surface-container-high",
        ai: "bg-secondary-container/30 text-secondary border border-secondary/40 hover:bg-secondary-container/50",
        danger: "bg-error-container text-on-error-container hover:brightness-110",
      },
      size: {
        sm: "h-8 px-3 text-[11px]",
        md: "h-9 px-4",
        lg: "h-11 px-5 text-[13px]",
        icon: "h-9 w-9 p-0",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
