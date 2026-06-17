import { cn } from "@/lib/cn";

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded border border-outline-variant bg-surface-container-high text-[10px] font-mono text-on-surface-variant",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
