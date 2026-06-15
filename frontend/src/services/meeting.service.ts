import { api, USE_MOCK_API } from "./api";
import { mockAdapter } from "./mock.adapter";
import type { ActionItem, Meeting, MeetingDetail, UploadInitResponse } from "@/types";

export const meetingService = {
  async list(): Promise<Meeting[]> {
    if (USE_MOCK_API) return mockAdapter.listMeetings();
    const { data } = await api.get<Meeting[]>("/meetings");
    return data;
  },

  async get(id: string): Promise<MeetingDetail | null> {
    if (USE_MOCK_API) return mockAdapter.getMeeting(id);
    const { data } = await api.get<MeetingDetail>(`/meetings/${id}`);
    return data;
  },

  async upload(
    file: File,
    onProgress?: (n: number) => void,
  ): Promise<UploadInitResponse> {
    if (USE_MOCK_API) return mockAdapter.upload(file, onProgress);
    const form = new FormData();
    form.append("file", file);
    const { data } = await api.post<UploadInitResponse>("/meetings/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
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
    if (USE_MOCK_API) return mockAdapter.toggleActionItem(meetingId, itemId, completed);
    const { data } = await api.put<ActionItem>(
      `/meetings/${meetingId}/action-items/${itemId}`,
      { completed },
    );
    return data;
  },

  async renameSpeakers(meetingId: string, labels: Record<string, string>): Promise<number> {
    if (USE_MOCK_API) return mockAdapter.renameSpeakers(meetingId, labels);
    const { data } = await api.put<{ updatedSegments: number }>(
      `/meetings/${meetingId}/speakers`,
      { labels },
    );
    return data.updatedSegments;
  },

  async remove(id: string): Promise<boolean> {
    if (USE_MOCK_API) return mockAdapter.deleteMeeting(id);
    const { data } = await api.delete<{ deleted: boolean }>(`/meetings/${id}`);
    return data.deleted;
  },
};
