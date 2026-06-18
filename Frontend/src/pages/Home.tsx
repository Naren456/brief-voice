import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles, RotateCcw, AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Dropzone } from "@/components/upload/Dropzone";
import { ProcessingStepper } from "@/components/upload/ProcessingStepper";
import { WarningBanner } from "@/components/upload/WarningBanner";
import { useUpload } from "@/hooks/useUpload";
import { useUploadStore } from "@/store/upload.store";
import { Button } from "@/components/ui/Button";
import { useMeeting } from "@/hooks/useMeetings";
import type { PipelineStep } from "@/types";

export function Home() {
  const navigate = useNavigate();
  const upload = useUpload();
  const {
    steps,
    uploadProgress,
    isUploading,
    activeMeetingId,
    fileName,
    fileSize,
    advanceStage,
    setStepFailed,
    reset,
  } = useUploadStore();
  const { data: activeMeeting, isError: meetingError } = useMeeting(
    activeMeetingId ?? undefined,
  );

  useEffect(() => {
    if (!activeMeeting) return;

    // Backend reported a processing failure — flag the active step.
    if (activeMeeting.status === "error") {
      setStepFailed();
      return;
    }

    // Map backend status to frontend pipeline stages.
    const statusMap: Record<string, PipelineStep["id"]> = {
      uploaded: "transmitted",
      processing: "diarization",
      transcribed: "transcription",
      summarizing: "summary",
      extracting_actions: "actionItems",
      indexing: "indexed",
      processed: "indexed",
    };

    const targetStage = statusMap[activeMeeting.status];
    if (targetStage) {
      advanceStage(targetStage);
    }
  }, [activeMeeting?.status, advanceStage, setStepFailed]);

  const handleFile = async (file: File) => {
    // Stay on the page so the live pipeline is visible; the user opens the
    // workspace explicitly once intelligence is ready.
    await upload.mutateAsync(file).catch(() => {});
  };

  const isFailed =
    activeMeeting?.status === "error" || steps.some((s) => s.status === "failed");
  // The tracked meeting 404s (e.g. deleted from the Vault) — don't strand the user.
  const isUnavailable = !!activeMeetingId && !isUploading && meetingError;
  const isReady =
    !!activeMeetingId &&
    !isUploading &&
    !isFailed &&
    !isUnavailable &&
    (activeMeeting?.status === "processed" ||
      steps.every((s) => s.status === "complete"));

  // Idle = nothing in flight and nothing being tracked → show the dropzone.
  const isIdle = !isUploading && !activeMeetingId;
  const isActive = !isIdle && !isReady && !isUnavailable;

  return (
    <div className="relative min-h-full flex items-center justify-center px-lg py-2xl">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
        <div className="absolute -top-1/4 left-1/4 w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[35%] h-[40%] bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-[1] max-w-2xl w-full space-y-lg"
      >
        <header className="text-center space-y-xs">
          <p className="font-mono text-label-sm text-primary uppercase tracking-widest">
            Ingestion Gateway
          </p>
          <h1 className="font-geist font-semibold text-headline-lg text-on-surface">
            Distill every meeting into intelligence.
          </h1>
          <p className="font-geist text-body-md text-on-surface-variant">
            Upload meeting recordings for AI synthesis, semantic indexing, and
            executive-grade briefs.
          </p>
        </header>

        <WarningBanner />

        {isIdle && <Dropzone onFile={handleFile} disabled={isUploading} />}

        {isUnavailable && (
          <div className="space-y-sm">
            <div className="flex items-start gap-sm p-md rounded-xl bg-surface-container border border-outline-variant">
              <AlertTriangle className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="font-geist text-body-md text-on-surface">
                  This upload is no longer available.
                </p>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
                  It may have been removed. Upload a new recording.
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-sm py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 font-mono text-label-md uppercase tracking-wider transition-colors active:scale-[0.99]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Back to upload
            </button>
          </div>
        )}

        {isActive && (
          <div className="space-y-sm">
            <ProcessingStepper
              steps={steps}
              progress={uploadProgress}
              fileName={fileName}
              fileSize={fileSize}
            />

            {isFailed && (
              <div className="flex items-start gap-sm p-md rounded-xl bg-error-container/20 border border-error/40">
                <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
                <p className="font-mono text-label-md text-error uppercase tracking-wider">
                  Processing failed. Try uploading the file again.
                </p>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-sm py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 font-mono text-label-md uppercase tracking-wider transition-colors active:scale-[0.99]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {isFailed ? "Start over" : "Upload a different file"}
            </button>
          </div>
        )}

        {isReady && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-sm"
          >
            <div className="flex items-center justify-between gap-md p-md bg-surface-container border border-outline-variant rounded-xl">
              <div className="flex items-center gap-md min-w-0">
                <div className="w-9 h-9 rounded-lg bg-tertiary-container/30 border border-tertiary/30 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-tertiary" />
                </div>
                <div className="min-w-0">
                  <p className="font-geist text-body-md text-on-surface truncate">
                    Intelligence indexed.
                  </p>
                  <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider truncate">
                    {fileName ? `${fileName} · ` : ""}Ready in the vault
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/meeting/${activeMeetingId}`)}
                className="shrink-0"
              >
                Open Workspace
              </Button>
            </div>

            <button
              onClick={reset}
              className="w-full flex items-center justify-center gap-sm py-2.5 rounded-xl border border-outline-variant/60 bg-surface-container-low/40 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 font-mono text-label-md uppercase tracking-wider transition-colors active:scale-[0.99]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Upload another meeting
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
