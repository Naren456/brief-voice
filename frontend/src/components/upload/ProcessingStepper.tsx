import { Check, Loader2, Circle } from "lucide-react";
import { motion } from "framer-motion";
import type { PipelineStep } from "@/types";
import { cn } from "@/lib/cn";

interface ProcessingStepperProps {
  steps: PipelineStep[];
  progress: number;
}

export function ProcessingStepper({ steps, progress }: ProcessingStepperProps) {
  const completedCount = steps.filter((s) => s.status === "complete").length;
  const overall =
    progress > 0 && progress < 100
      ? progress
      : Math.round(((completedCount + (steps.some((s) => s.status === "active") ? 0.5 : 0)) / steps.length) * 100);

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-lg space-y-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-label-md text-on-surface uppercase tracking-wider">
          Progressive Processing
        </h3>
        <span className="font-mono text-label-sm text-primary uppercase tracking-widest">
          Active Stream
        </span>
      </div>

      <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${overall}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <ol className="space-y-md">
        {steps.map((step, i) => {
          const isActive = step.status === "active";
          const isComplete = step.status === "complete";
          const isFailed = step.status === "failed";
          const isLast = i === steps.length - 1;
          return (
            <li key={step.id} className="relative flex items-start gap-md">
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[11px] top-7 bottom-[-12px] w-px",
                    isComplete ? "bg-tertiary/50" : "bg-outline-variant",
                  )}
                />
              )}
              <div
                className={cn(
                  "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border transition-colors",
                  isComplete && "bg-tertiary-container/40 border-tertiary/50",
                  isActive && "bg-primary/20 border-primary/40",
                  !isComplete && !isActive && "bg-surface-container-high border-outline-variant",
                  isFailed && "bg-error-container/30 border-error/60",
                )}
              >
                {isComplete ? (
                  <Check className="w-3.5 h-3.5 text-tertiary" strokeWidth={2.5} />
                ) : isActive ? (
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                ) : (
                  <Circle className="w-2 h-2 text-outline fill-outline" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-mono text-label-md uppercase tracking-wider",
                    isComplete && "text-tertiary",
                    isActive && "text-primary",
                    !isComplete && !isActive && "text-on-surface-variant",
                  )}
                >
                  {step.label}
                </p>
                <p className="font-mono text-label-sm text-on-surface-variant/70 uppercase tracking-wider">
                  {step.description}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
