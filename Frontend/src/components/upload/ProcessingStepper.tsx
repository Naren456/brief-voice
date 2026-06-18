import { Check, Loader2, Circle, AlertTriangle } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import type { PipelineStep } from "@/types";
import { cn } from "@/lib/cn";

interface ProcessingStepperProps {
  steps: PipelineStep[];
  progress: number;
  fileName?: string | null;
  fileSize?: number | null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i += 1;
  }
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function ProcessingStepper({ steps, progress, fileName, fileSize }: ProcessingStepperProps) {
  const reduce = useReducedMotion();
  const completedCount = steps.filter((s) => s.status === "complete").length;
  const hasActive = steps.some((s) => s.status === "active");
  const hasFailed = steps.some((s) => s.status === "failed");
  const overall =
    progress > 0 && progress < 100
      ? progress
      : Math.round(((completedCount + (hasActive ? 0.5 : 0)) / steps.length) * 100);

  return (
    <div className="relative overflow-hidden bg-surface-container border border-outline-variant rounded-xl p-lg space-y-lg">
      <style>{`
        @keyframes bvBarShimmer { from { transform: translateX(-120%); } to { transform: translateX(320%); } }
        @keyframes bvFlow { from { transform: translateY(-120%); } to { transform: translateY(240%); } }
        @keyframes bvDots { 0% { content: ""; } 25% { content: "."; } 50% { content: ".."; } 75%, 100% { content: "..."; } }
        .bv-bar-shimmer { animation: bvBarShimmer 1.9s linear infinite; }
        .bv-flow { animation: bvFlow 1.5s linear infinite; }
        .bv-ellipsis::after { content: ""; display: inline-block; width: 1ch; text-align: left; animation: bvDots 1.4s steps(1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .bv-bar-shimmer, .bv-flow, .bv-ellipsis::after { animation: none; }
          .bv-ellipsis::after { content: ""; }
        }
      `}</style>

      {/* Ambient glow that tracks the active processing state */}
      {hasActive && !reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/15 blur-[70px]"
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.92, 1.08, 0.92] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}

      <div className="relative flex items-center justify-between gap-md">
        <div className="min-w-0">
          <h3 className="font-mono text-label-md text-on-surface uppercase tracking-wider">
            Progressive Processing
          </h3>
          {fileName ? (
            <p className="mt-0.5 truncate font-mono text-label-sm text-on-surface-variant/80">
              {fileName}
              {fileSize ? ` · ${formatBytes(fileSize)}` : ""}
            </p>
          ) : null}
        </div>
        <span
          className={cn(
            "shrink-0 font-mono text-label-sm uppercase tracking-widest tabular-nums",
            hasFailed ? "text-error" : "text-primary",
          )}
        >
          {overall}%
        </span>
      </div>

      {/* Progress bar with a glowing comet head + shimmer sweep */}
      <div className="relative h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "relative h-full rounded-full",
            hasFailed ? "bg-error" : "bg-primary",
          )}
          initial={{ width: 0 }}
          animate={{ width: `${overall}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ boxShadow: hasFailed ? "none" : "0 0 12px rgba(192,193,255,0.55)" }}
        >
          {/* moving light sweep */}
          {hasActive && !hasFailed ? (
            <span className="absolute inset-0 overflow-hidden rounded-full">
              <span className="bv-bar-shimmer absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent" />
            </span>
          ) : null}
          {/* comet head */}
          {hasActive && !hasFailed && overall > 2 && overall < 100 ? (
            <span className="absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary shadow-[0_0_10px_3px_rgba(192,193,255,0.7)]" />
          ) : null}
        </motion.div>
      </div>

      <motion.ol
        className="relative space-y-md"
        initial={reduce ? false : "hidden"}
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.07 } } }}
      >
        {steps.map((step, i) => {
          const isActive = step.status === "active";
          const isComplete = step.status === "complete";
          const isFailed = step.status === "failed";
          const isLast = i === steps.length - 1;
          const nextActive = !isLast && steps[i + 1]?.status === "active";
          return (
            <motion.li
              key={step.id}
              className={cn(
                "relative flex items-start gap-md rounded-lg p-2 -mx-2 transition-colors duration-500",
                isActive && "bg-primary/[0.06]",
              )}
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.4 } },
              }}
            >
              {/* Connector line to the next step */}
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-[19px] top-9 bottom-[-12px] w-px overflow-hidden",
                    isComplete ? "bg-tertiary/50" : "bg-outline-variant",
                  )}
                >
                  {/* flowing pulse on the segment feeding the active step */}
                  {(isComplete && nextActive) ? (
                    <span className="bv-flow absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-transparent via-primary to-transparent" />
                  ) : null}
                </span>
              )}

              {/* Node */}
              <div className="relative z-10 shrink-0">
                {/* radar ping on the active node */}
                {isActive && !reduce ? (
                  <>
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full border border-primary/50"
                      animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.span
                      aria-hidden
                      className="absolute inset-0 rounded-full border border-primary/40"
                      animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.9 }}
                    />
                  </>
                ) : null}
                <div
                  className={cn(
                    "relative w-6 h-6 rounded-full flex items-center justify-center border transition-colors duration-300",
                    isComplete && "bg-tertiary-container/40 border-tertiary/50",
                    isActive && "bg-primary/20 border-primary/60 shadow-[0_0_12px_rgba(192,193,255,0.45)]",
                    !isComplete && !isActive && !isFailed && "bg-surface-container-high border-outline-variant",
                    isFailed && "bg-error-container/30 border-error/60",
                  )}
                >
                  {isComplete ? (
                    <motion.span
                      initial={reduce ? false : { scale: 0, rotate: -30 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 520, damping: 18 }}
                    >
                      <Check className="w-3.5 h-3.5 text-tertiary" strokeWidth={2.5} />
                    </motion.span>
                  ) : isActive ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                  ) : isFailed ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-error" strokeWidth={2.5} />
                  ) : (
                    <Circle className="w-2 h-2 text-outline fill-outline" />
                  )}
                </div>
              </div>

              {/* Labels */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p
                  className={cn(
                    "font-mono text-label-md uppercase tracking-wider transition-colors duration-300",
                    isComplete && "text-tertiary",
                    isActive && "text-primary",
                    isFailed && "text-error",
                    !isComplete && !isActive && !isFailed && "text-on-surface-variant",
                  )}
                >
                  {step.label}
                </p>
                <p
                  className={cn(
                    "font-mono text-label-sm uppercase tracking-wider transition-colors duration-300",
                    isActive ? "text-primary/80 bv-ellipsis" : "text-on-surface-variant/70",
                  )}
                >
                  {step.description}
                </p>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
    </div>
  );
}
