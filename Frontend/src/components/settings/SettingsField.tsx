import { cn } from "@/lib/cn";

interface SettingsFieldProps {
  label: React.ReactNode;
  description?: React.ReactNode;
  control: React.ReactNode;
  align?: "center" | "start";
  className?: string;
  fullWidth?: boolean;
  htmlFor?: string;
}

export function SettingsField({
  label,
  description,
  control,
  align = "center",
  className,
  fullWidth,
  htmlFor,
}: SettingsFieldProps) {
  return (
    <div
      className={cn(
        "grid gap-md py-3",
        "grid-cols-1 sm:grid-cols-[1fr_auto]",
        align === "start" ? "items-start" : "items-center",
        fullWidth && "sm:grid-cols-1",
        className,
      )}
    >
      <div className="min-w-0 max-w-2xl">
        <label
          htmlFor={htmlFor}
          className="font-geist text-body-md text-on-surface block leading-tight"
        >
          {label}
        </label>
        {description && (
          <p className="font-geist text-body-md text-on-surface-variant mt-0.5">
            {description}
          </p>
        )}
      </div>
      <div className={cn("sm:justify-self-end w-full sm:w-auto", fullWidth && "sm:w-full")}>
        {control}
      </div>
    </div>
  );
}
