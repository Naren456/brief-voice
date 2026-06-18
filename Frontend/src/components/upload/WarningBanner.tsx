import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;

export function WarningBanner() {
  const [dismissed, setDismissed] = useState(false);

  // Only warn when the API URL is not configured — everything else is fine.
  if (API_URL || dismissed) return null;

  return (
    <div className="flex items-start gap-md p-md rounded-lg border border-error-container/40 bg-error-container/10">
      <AlertTriangle className="w-4 h-4 text-error mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-label-md text-error uppercase tracking-wider mb-0.5">
          API Not Configured
        </p>
        <p className="font-geist text-body-md text-on-surface-variant">
          Set <code className="font-mono text-primary text-[12px]">VITE_API_URL</code> in your{" "}
          <code className="font-mono text-primary text-[12px]">.env</code> file to connect to the
          BriefVoice backend.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-on-surface-variant hover:text-on-surface transition-colors"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

