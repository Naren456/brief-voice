import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type ToastVariant = "info" | "success" | "error";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  durationMs?: number;
}

interface ToastContextValue {
  push: (t: Omit<Toast, "id"> & { id?: string }) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      push: (_: any) => {
        if (typeof window !== "undefined") {
          // eslint-disable-next-line no-console
          console.info("[toast]", _);
        }
        return "";
      },
      dismiss: () => undefined,
    };
  }
  return ctx;
}

const VARIANT_MAP: Record<ToastVariant, { icon: typeof Info; color: string; ring: string }> = {
  info: { icon: Info, color: "text-primary", ring: "border-primary/30" },
  success: { icon: CheckCircle2, color: "text-tertiary", ring: "border-tertiary/40" },
  error: { icon: AlertTriangle, color: "text-error", ring: "border-error/40" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
    const handle = timers.current.get(id);
    if (handle != null) {
      window.clearTimeout(handle);
      timers.current.delete(id);
    }
  }, []);

  const push = useCallback(
    (t: Omit<Toast, "id"> & { id?: string }) => {
      const id = t.id ?? `t_${Math.random().toString(36).slice(2, 9)}`;
      const next: Toast = { id, durationMs: 4200, ...t };
      setToasts((arr) => [...arr, next]);
      if (next.durationMs && next.durationMs > 0) {
        const handle = window.setTimeout(() => dismiss(id), next.durationMs);
        timers.current.set(id, handle);
      }
      return id;
    },
    [dismiss],
  );

  useEffect(
    () => () => {
      timers.current.forEach((h) => window.clearTimeout(h));
      timers.current.clear();
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ push, dismiss }}>
      {children}
      <div className="fixed bottom-24 right-6 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const v = VARIANT_MAP[t.variant];
            const Icon = v.icon;
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.97 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "pointer-events-auto relative flex items-start gap-md p-3 pr-9 rounded-xl bg-surface-container border shadow-ambient",
                  v.ring,
                )}
              >
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", v.color)} />
                <div className="min-w-0">
                  <p className="font-geist text-body-md text-on-surface">{t.title}</p>
                  {t.description && (
                    <p className="font-geist text-body-md text-on-surface-variant mt-0.5">
                      {t.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="absolute right-2 top-2 text-on-surface-variant hover:text-on-surface focus-ring rounded"
                  aria-label="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
