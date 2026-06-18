import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
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
  const { steps, uploadProgress, isUploading, activeMeetingId, advanceStage } = useUploadStore();
  const { data: activeMeeting } = useMeeting(activeMeetingId ?? undefined);

  useEffect(() => {
    if (!activeMeeting) return;
    
    // Map backend status to frontend pipeline stages
    const statusMap: Record<string, PipelineStep["id"]> = {
      uploaded: "diarization",
      processing: "diarization",
      transcribing: "transcription",
      summarizing: "summary",
      ready: "indexed",
    };

    const targetStage = statusMap[activeMeeting.status];
    if (targetStage) {
      advanceStage(targetStage);
    }
  }, [activeMeeting?.status, advanceStage]);

  const handleFile = async (file: File) => {
    await upload.mutateAsync(file);
  };

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

        {!isUploading && !activeMeetingId && (
          <Dropzone onFile={handleFile} disabled={isUploading} />
        )}

        {(isUploading || steps.some((s) => s.status !== "pending")) && (
          <ProcessingStepper steps={steps} progress={uploadProgress} />
        )}

        {activeMeetingId && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between gap-md p-md bg-surface-container border border-outline-variant rounded-xl"
          >
            <div className="flex items-center gap-md min-w-0">
              <div className="w-9 h-9 rounded-lg bg-tertiary-container/30 border border-tertiary/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-tertiary" />
              </div>
              <div className="min-w-0">
                <p className="font-geist text-body-md text-on-surface">
                  Intelligence indexed.
                </p>
                <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Meeting is ready in the vault
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/meeting/${activeMeetingId}`)}
            >
              Open Workspace
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
