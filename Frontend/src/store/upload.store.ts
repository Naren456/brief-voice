import { create } from "zustand";
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
  uploadProgress: number;
  isUploading: boolean;
  steps: PipelineStep[];
  activeMeetingId: string | null;
  setFile: (f: File | null) => void;
  setProgress: (p: number) => void;
  setUploading: (u: boolean) => void;
  setActiveMeetingId: (id: string | null) => void;
  advanceStage: (id: PipelineStep["id"]) => void;
  resetSteps: () => void;
}

export const useUploadStore = create<UploadState>((set) => ({
  file: null,
  uploadProgress: 0,
  isUploading: false,
  steps: PIPELINE_STAGES.map((s) => ({ ...s })),
  activeMeetingId: null,
  setFile: (file) => set({ file }),
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
  resetSteps: () => set({ steps: PIPELINE_STAGES.map((s) => ({ ...s })) }),
}));
