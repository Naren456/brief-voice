import { cn } from "@/lib/cn";

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  description?: string;
}

interface RadioGroupProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: RadioOption<T>[];
  layout?: "vertical" | "horizontal" | "segmented";
  className?: string;
}

export function RadioGroup<T extends string>({
  value,
  onChange,
  options,
  layout = "segmented",
  className,
}: RadioGroupProps<T>) {
  if (layout === "segmented") {
    return (
      <div
        className={cn(
          "inline-flex p-0.5 rounded-lg border border-outline-variant bg-surface-container-low",
          className,
        )}
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "px-3 h-8 rounded-md font-mono text-label-md tracking-wide uppercase transition-colors",
                active
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className={cn(
        layout === "horizontal" ? "flex flex-wrap gap-md" : "flex flex-col gap-sm",
        className,
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "flex items-start gap-md p-3 text-left rounded-lg border transition-colors",
              active
                ? "border-primary/50 bg-primary/5"
                : "border-outline-variant hover:border-outline bg-surface-container-low",
            )}
          >
            <span
              className={cn(
                "mt-1 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                active ? "border-primary" : "border-outline-variant",
              )}
            >
              {active && <span className="w-2 h-2 rounded-full bg-primary" />}
            </span>
            <span className="flex-1">
              <p className="font-geist text-body-md text-on-surface">{opt.label}</p>
              {opt.description && (
                <p className="font-geist text-body-md text-on-surface-variant">
                  {opt.description}
                </p>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
