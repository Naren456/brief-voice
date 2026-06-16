import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SaveBarProps {
  visible: boolean;
  saving?: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveBar({ visible, saving, onSave, onDiscard }: SaveBarProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="savebar"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="fixed left-0 md:left-64 right-0 bottom-20 z-30 px-lg pointer-events-none"
        >
          <div className="pointer-events-auto mx-auto max-w-4xl flex items-center justify-between gap-md px-lg py-3 rounded-xl border border-outline-variant bg-surface-container-high/95 backdrop-blur-md shadow-ambient">
            <div className="flex items-center gap-sm min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <p className="font-geist text-body-md text-on-surface truncate">
                You have unsaved changes
              </p>
              <span className="hidden md:inline font-mono text-label-sm text-on-surface-variant uppercase tracking-widest ml-2">
                Press ⌘S to save
              </span>
            </div>
            <div className="flex items-center gap-sm">
              <Button variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
                <Undo2 className="w-3.5 h-3.5" />
                Discard
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={onSave}
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                {saving ? "Saving…" : "Save changes"}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
