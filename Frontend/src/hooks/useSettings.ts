import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsService } from "@/services/settings.service";
import { useSettingsStore } from "@/store/settings.store";
import { useToast } from "@/components/ui/Toast";
import { meetingKeys } from "@/hooks/useMeetings";

export const settingsKeys = {
  all: ["settings"] as const,
};

export function useSettingsBootstrap() {
  const setHydrated = useSettingsStore((s) => s.setHydrated);
  const query = useQuery({
    queryKey: settingsKeys.all,
    queryFn: settingsService.get,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (query.data) setHydrated(query.data);
  }, [query.data, setHydrated]);

  return query;
}

export function useSaveSettings() {
  const qc = useQueryClient();
  const commit = useSettingsStore((s) => s.commit);
  const toast = useToast();

  return useMutation({
    mutationFn: settingsService.save,
    onMutate: (next) => {
      // Optimistic: snapshot prior cache
      const prev = qc.getQueryData(settingsKeys.all);
      qc.setQueryData(settingsKeys.all, next);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(settingsKeys.all, ctx.prev);
      toast.push({
        title: "Failed to save settings",
        description: "Your changes were not synced. Try again.",
        variant: "error",
      });
    },
    onSuccess: (saved) => {
      commit(saved);
      toast.push({
        title: "Settings saved",
        description: "Your preferences are synced across the workspace.",
        variant: "success",
      });
    },
  });
}

export function useRunDangerousAction() {
  const toast = useToast();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: settingsService.runDangerousAction,
    onSuccess: (res) => {
      if (res.action === "delete_all_meetings") {
        qc.invalidateQueries({ queryKey: meetingKeys.all });
      }
      toast.push({
        title: `Action completed — ${res.action}`,
        description: "The operation finished successfully.",
        variant: "success",
      });
    },
    onError: () => {
      toast.push({
        title: "Action failed",
        description: "Please retry or contact support.",
        variant: "error",
      });
    },
  });
}
