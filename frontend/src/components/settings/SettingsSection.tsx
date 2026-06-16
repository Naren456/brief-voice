import { cn } from "@/lib/cn";

interface SettingsSectionProps {
  id: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  id,
  title,
  description,
  badge,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      id={id}
      data-settings-section={id}
      className={cn("scroll-mt-20 space-y-md", className)}
    >
      <header className="flex items-start justify-between gap-md">
        <div className="space-y-1">
          <h2 className="font-geist font-semibold text-on-surface text-headline-md leading-tight">
            {title}
          </h2>
          {description && (
            <p className="font-geist text-body-md text-on-surface-variant max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {badge}
      </header>
      <div className="rounded-xl border border-outline-variant bg-surface-container divide-y divide-outline-variant">
        {children}
      </div>
    </section>
  );
}

interface SubsectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Subsection({ title, description, children, className }: SubsectionProps) {
  return (
    <div className={cn("p-lg space-y-md", className)}>
      <header className="space-y-1">
        <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest">
          {title}
        </p>
        {description && (
          <p className="font-geist text-body-md text-on-surface-variant max-w-2xl">
            {description}
          </p>
        )}
      </header>
      <div className="space-y-md">{children}</div>
    </div>
  );
}
