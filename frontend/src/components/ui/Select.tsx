import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { useId } from "react";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  hint?: string;
}

interface SelectProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: SelectOption<T>[];
  className?: string;
  ariaLabel?: string;
  disabled?: boolean;
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  className,
  ariaLabel,
  disabled,
}: SelectProps<T>) {
  const id = useId();
  return (
    <div className={cn("relative inline-flex w-full max-w-xs", className)}>
      <select
        id={id}
        aria-label={ariaLabel}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as T)}
        className={cn(
          "w-full h-9 pl-3 pr-9 rounded-lg bg-surface-container-lowest border border-outline-variant",
          "font-geist text-body-md text-on-surface focus-ring transition-colors appearance-none cursor-pointer",
          "hover:border-outline",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-surface-container">
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
    </div>
  );
}
