import { cn } from "@/lib/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function Switch({
  checked,
  onChange,
  disabled,
  size = "md",
  className,
  id,
  "aria-label": ariaLabel,
}: SwitchProps) {
  const dim =
    size === "sm"
      ? { track: "w-8 h-4", thumb: "w-3 h-3", offset: "translate-x-4" }
      : { track: "w-10 h-5", thumb: "w-3.5 h-3.5", offset: "translate-x-5" };
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex items-center rounded-full border transition-colors focus-ring",
        dim.track,
        checked
          ? "bg-primary-container/80 border-primary/40"
          : "bg-surface-container-high border-outline-variant",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full transition-transform duration-200 ease-out",
          dim.thumb,
          checked ? "bg-primary" : "bg-on-surface-variant",
          "ml-0.5",
          checked && dim.offset,
        )}
      />
    </button>
  );
}
