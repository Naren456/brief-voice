import { cn } from "@/lib/cn";

const PALETTES = [
  "bg-secondary-container/70 text-secondary-fixed-dim",
  "bg-tertiary-container/30 text-tertiary",
  "bg-primary/15 text-primary",
  "bg-surface-container-highest text-on-surface",
  "bg-error-container/20 text-error",
];

function hashIndex(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h % PALETTES.length;
}

interface SpeakerBadgeProps {
  name?: string | null;
  size?: "sm" | "md";
  className?: string;
  onClick?: () => void;
}

export function SpeakerBadge({ name, size = "md", className, onClick }: SpeakerBadgeProps) {
  const safeName = name || "Unassigned";
  const palette = PALETTES[hashIndex(safeName)];
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded font-mono uppercase tracking-wider transition-all",
        "hover:brightness-110",
        size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-label-sm",
        palette,
        className,
      )}
    >
      {safeName}
    </button>
  );
}
