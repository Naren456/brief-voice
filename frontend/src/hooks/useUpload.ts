import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingService } from "@/services/meeting.service";
import { useUploadStore } from "@/store/upload.store";
import { meetingKeys } from "./useMeetings";

const SIMULATED_DELAYS: Record<string, number> = {
  diarization: 900,
  transcription: 1400,
  summary: 1100,
  actionItems: 800,
  indexed: 600,
};

export function useUpload() {
  const qc = useQueryClient();
  const {
    setProgress,
    setUploading,
    setActiveMeetingId,
    advanceStage,
    resetSteps,
  } = useUploadStore();

  return useMutation({
    mutationFn: async (file: File) => {
      resetSteps();
      setUploading(true);
      setProgress(0);
      advanceStage("transmitted");

      const res = await meetingService.upload(file, (p) => setProgress(p));
      setActiveMeetingId(res.meetingId);

      const order = ["diarization", "transcription", "summary", "actionItems", "indexed"] as const;
      for (const stage of order) {
        advanceStage(stage);
        await new Promise((r) => setTimeout(r, SIMULATED_DELAYS[stage] ?? 500));
      }
      return res;
    },
    onSettled: () => {
      setUploading(false);
      qc.invalidateQueries({ queryKey: meetingKeys.all });
    },
  });
}
