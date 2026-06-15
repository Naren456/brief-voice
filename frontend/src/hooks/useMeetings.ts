import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { meetingService } from "@/services/meeting.service";

export const meetingKeys = {
  all: ["meetings"] as const,
  detail: (id: string) => ["meetings", id] as const,
};

export function useMeetings() {
  return useQuery({
    queryKey: meetingKeys.all,
    queryFn: meetingService.list,
    staleTime: 30_000,
  });
}

export function useMeeting(id: string | undefined) {
  return useQuery({
    queryKey: meetingKeys.detail(id ?? ""),
    queryFn: () => meetingService.get(id!),
    enabled: !!id,
  });
}

export function useToggleActionItem(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, completed }: { itemId: string; completed: boolean }) =>
      meetingService.toggleActionItem(meetingId, itemId, completed),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
    },
  });
}

export function useRenameSpeakers(meetingId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labels: Record<string, string>) =>
      meetingService.renameSpeakers(meetingId, labels),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: meetingKeys.detail(meetingId) });
    },
  });
}

export function useDeleteMeeting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => meetingService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: meetingKeys.all }),
  });
}
