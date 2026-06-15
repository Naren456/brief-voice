import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-2xl px-lg gap-md",
        "border border-dashed border-outline-variant rounded-xl bg-surface-container-low/40",
        className,
      )}
    >
      <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center">
        <Icon className="w-5 h-5 text-on-surface-variant" />
      </div>
      <div className="space-y-xs">
        <h4 className="font-geist text-on-surface text-body-lg">{title}</h4>
        {description && (
          <p className="font-geist text-body-md text-on-surface-variant max-w-md">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
