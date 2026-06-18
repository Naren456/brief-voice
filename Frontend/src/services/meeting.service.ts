import { api } from "./api";
import type { ActionItem, Meeting, MeetingDetail, UploadInitResponse } from "@/types";

export const meetingService = {
  async list(): Promise<Meeting[]> {
    const { data } = await api.get<Meeting[]>("/meetings");
    return data;
  },

  async get(id: string): Promise<MeetingDetail | null> {
    const { data } = await api.get<MeetingDetail>(`/meetings/${id}`);
    return data;
  },

  async upload(
    file: File,
    onProgress?: (n: number) => void,
  ): Promise<UploadInitResponse> {
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<UploadInitResponse>("/meetings/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
      // Large recordings (up to 500MB) over a cold backend can far exceed the
      // 30s global axios timeout, which silently aborts the upload. Disable it
      // for this request; upload progress already gives the user feedback.
      timeout: 0,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      onUploadProgress: (e) => {
        if (e.total) onProgress?.(Math.round((e.loaded / e.total) * 100));
      },
    });
    return data;
  },

  async toggleActionItem(
    meetingId: string,
    itemId: string,
    completed: boolean,
  ): Promise<ActionItem | null> {
    const { data } = await api.put<ActionItem>(
      `/meetings/${meetingId}/action-items/${itemId}`,
      { completed },
    );
    return data;
  },

  async renameSpeakers(meetingId: string, labels: Record<string, string>): Promise<number> {
    const { data } = await api.put<{ updatedSegments: number }>(
      `/meetings/${meetingId}/speakers`,
      { labels },
    );
    return data.updatedSegments;
  },

  async remove(id: string): Promise<boolean> {
    const { data } = await api.delete<{ deleted: boolean }>(`/meetings/${id}`);
    return data.deleted;
  },
};
