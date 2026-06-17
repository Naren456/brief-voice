import { cn } from "@/lib/cn";

export const QUICK_FILTERS = [
  "Project Timeline",
  "Infrastructure Budget",
  "User Feedback",
  "Product Strategy",
];

interface QuickFiltersProps {
  active?: string | null;
  onSelect: (label: string) => void;
}

export function QuickFilters({ active, onSelect }: QuickFiltersProps) {
  return (
    <div className="flex items-center gap-md pb-1 overflow-x-auto no-scrollbar">
      <span className="shrink-0 font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
        Common Queries
      </span>
      {QUICK_FILTERS.map((f) => {
        const isActive = active === f;
        return (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full border font-mono text-label-md tracking-wide transition-all",
              isActive
                ? "border-primary text-primary bg-primary/10"
                : "border-outline-variant text-on-surface-variant hover:border-primary/40 hover:text-primary",
            )}
          >
            {f}
          </button>
        );
      })}
    </div>
  );
}
