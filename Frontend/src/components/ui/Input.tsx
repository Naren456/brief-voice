import * as React from "react";
import { cn } from "@/lib/cn";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-10 w-full rounded-lg bg-surface-container-lowest border border-outline-variant px-3 text-body-md text-on-surface placeholder:text-outline/70 focus-ring transition-colors",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";
