import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PipelineStep } from "@/types";

export const PIPELINE_STAGES: PipelineStep[] = [
  {
    id: "transmitted",
    label: "Payload Transmitted",
    description: "Bytes received on ingestion edge",
    status: "pending",
  },
  {
    id: "diarization",
    label: "Speaker Diarization",
    description: "Identifying unique voice patterns",
    status: "pending",
  },
  {
    id: "transcription",
    label: "Transcript Generation",
    description: "Streaming verbatim text + timestamps",
    status: "pending",
  },
  {
    id: "summary",
    label: "AI Summary",
    description: "Distilling decisions and discussion points",
    status: "pending",
  },
  {
    id: "actionItems",
    label: "Action Items",
    description: "Extracting owners and deadlines",
    status: "pending",
  },
  {
    id: "indexed",
    label: "Intelligence Indexed",
    description: "Embedded into semantic vault",
    status: "pending",
  },
];

interface UploadState {
  file: File | null;
  fileName: string | null;
  fileSize: number | null;
  uploadProgress: number;
  isUploading: boolean;
  steps: PipelineStep[];
  activeMeetingId: string | null;
  setFile: (f: File | null) => void;
  setFileMeta: (name: string | null, size: number | null) => void;
  setProgress: (p: number) => void;
  setUploading: (u: boolean) => void;
  setActiveMeetingId: (id: string | null) => void;
  advanceStage: (id: PipelineStep["id"]) => void;
  resetSteps: () => void;
  /** Marks the current in-progress step as failed (backend status "error"). */
  setStepFailed: () => void;
  /** Clears all upload state so the dropzone becomes available again. */
  reset: () => void;
}

const freshSteps = () => PIPELINE_STAGES.map((s) => ({ ...s }));

export const useUploadStore = create<UploadState>()(
  persist(
    (set) => ({
      file: null,
      fileName: null,
      fileSize: null,
      uploadProgress: 0,
      isUploading: false,
      steps: freshSteps(),
      activeMeetingId: null,
      setFile: (file) => set({ file }),
      setFileMeta: (fileName, fileSize) => set({ fileName, fileSize }),
      setProgress: (uploadProgress) => set({ uploadProgress }),
      setUploading: (isUploading) => set({ isUploading }),
      setActiveMeetingId: (activeMeetingId) => set({ activeMeetingId }),
      advanceStage: (id) =>
        set((s) => {
          const steps = s.steps.map((step) => ({ ...step }));
          const idx = steps.findIndex((step) => step.id === id);
          if (idx === -1) return { steps };
          for (let i = 0; i < idx; i++) steps[i].status = "complete";
          steps[idx].status = "active";
          for (let i = idx + 1; i < steps.length; i++) steps[i].status = "pending";
          return { steps };
        }),
      resetSteps: () => set({ steps: freshSteps() }),
      setStepFailed: () =>
        set((s) => {
          const steps = s.steps.map((step) => ({ ...step }));
          const idx = steps.findIndex((step) => step.status === "active");
          const target =
            idx === -1 ? steps.findIndex((step) => step.status !== "complete") : idx;
          if (target !== -1) steps[target].status = "failed";
          return { steps };
        }),
      reset: () =>
        set({
          file: null,
          fileName: null,
          fileSize: null,
          uploadProgress: 0,
          isUploading: false,
          steps: freshSteps(),
          activeMeetingId: null,
        }),
    }),
    {
      name: "briefvoice-upload-store",
      storage: createJSONStorage(() => sessionStorage),
      // Deliberately do NOT persist activeMeetingId or steps. Persisting an
      // in-flight pipeline across reloads was the root cause of the upload
      // lockout (a stale meeting id / non-pending steps hid the dropzone with
      // no way back). A reload now starts idle; in-progress meetings still
      // surface in the Vault. Only lightweight display hints persist.
      partialize: (state) => ({
        fileName: state.fileName,
        fileSize: state.fileSize,
      }),
    }
  )
);
