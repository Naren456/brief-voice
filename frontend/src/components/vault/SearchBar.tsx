import { Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";
import { Kbd } from "@/components/ui/Kbd";

interface SearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ref.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Sparkles className="w-4 h-4 text-primary" />
      </div>
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          placeholder ??
          "e.g., What did Narendra decide about the Prisma schema migrations?"
        }
        className="w-full h-14 rounded-xl bg-surface-container-lowest border border-outline-variant pl-11 pr-14 font-geist text-body-lg text-on-surface placeholder:text-outline/80 focus-ring transition-colors"
      />
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <Kbd>⌘K</Kbd>
      </div>
    </div>
  );
}
