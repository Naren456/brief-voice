import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meetingService } from "@/services/meeting.service";
import { useUploadStore } from "@/store/upload.store";
import { meetingKeys } from "./useMeetings";

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
      
      // Let the backend status polling handle the rest
      return res;
    },
    onSettled: () => {
      setUploading(false);
      qc.invalidateQueries({ queryKey: meetingKeys.all });
    },
  });
}
