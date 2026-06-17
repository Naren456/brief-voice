import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/cn";

interface AccordionItem {
  id: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  className?: string;
}

export function Accordion({ items, defaultOpen, className }: AccordionProps) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  return (
    <div className={cn("divide-y divide-outline-variant border border-outline-variant rounded-xl bg-surface-container-low", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between gap-md p-md text-left transition-colors hover:bg-surface-container-high/40"
              aria-expanded={isOpen}
            >
              <div className="min-w-0">
                <p className="font-geist font-medium text-on-surface text-body-md">
                  {item.title}
                </p>
                {item.subtitle && (
                  <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
                    {item.subtitle}
                  </p>
                )}
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-on-surface-variant transition-transform shrink-0",
                  isOpen && "rotate-180 text-primary",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden border-t border-outline-variant"
                >
                  <div className="p-md">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
