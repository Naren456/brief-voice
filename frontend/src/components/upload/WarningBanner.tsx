import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export function WarningBanner() {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;
  return (
    <div className="flex items-start gap-md p-md rounded-lg border border-error-container/40 bg-error-container/10">
      <AlertTriangle className="w-4 h-4 text-error mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-label-md text-error uppercase tracking-wider mb-0.5">
          Signal Quality Warning
        </p>
        <p className="font-geist text-body-md text-on-surface-variant">
          High background noise or low bit-rate detected. Transcription accuracy may
          fall below the optimal 10% WER ceiling.
        </p>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
