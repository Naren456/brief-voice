import type {
  ActionItem,
  AnalyticsOverview,
  Meeting,
  MeetingDetail,
  SearchResult,
  UploadInitResponse,
} from "@/types";
import {
  MOCK_ANALYTICS,
  MOCK_MEETINGS,
  MOCK_MEETING_DETAIL,
  MOCK_SEARCH_RESULTS,
} from "./mock.data";

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

let MEETINGS = [...MOCK_MEETINGS];
const DETAIL = { ...MOCK_MEETING_DETAIL };

export const mockAdapter = {
  async listMeetings(): Promise<Meeting[]> {
    return delay(MEETINGS);
  },

  async getMeeting(id: string): Promise<MeetingDetail | null> {
    return delay(DETAIL[id] ?? null);
  },

  async upload(file: File, onProgress?: (n: number) => void): Promise<UploadInitResponse> {
    return new Promise((resolve) => {
      let progress = 0;
      const tick = () => {
        progress = Math.min(progress + Math.random() * 18, 100);
        onProgress?.(progress);
        if (progress < 100) {
          setTimeout(tick, 220);
        } else {
          const id = `m_${Math.random().toString(36).slice(2, 8)}`;
          const newMeeting: Meeting = {
            id,
            filename: file.name,
            title: file.name.replace(/\.[a-z0-9]+$/i, ""),
            category: "Untitled",
            status: "processing",
            createdAt: new Date().toISOString(),
            durationMs: 25 * 60_000,
            speakerCount: 0,
            actionItemCount: 0,
            summarySnippet: "Pipeline started — synthesizing intelligence…",
          };
          MEETINGS = [newMeeting, ...MEETINGS];
          DETAIL[id] = {
            ...newMeeting,
            transcript: null,
            summary: null,
            actionItems: [],
            speakingTime: [],
            keywordFrequency: [],
          };
          resolve({
            meetingId: id,
            filename: file.name,
            status: "processing",
          });
        }
      };
      setTimeout(tick, 200);
    });
  },

  async search(query: string): Promise<SearchResult[]> {
    return delay(MOCK_SEARCH_RESULTS(query), 280);
  },

  async getAnalytics(): Promise<AnalyticsOverview> {
    return delay(MOCK_ANALYTICS);
  },

  async toggleActionItem(meetingId: string, itemId: string, completed: boolean): Promise<ActionItem | null> {
    const detail = DETAIL[meetingId];
    if (!detail) return null;
    const item = detail.actionItems.find((a) => a.id === itemId);
    if (!item) return null;
    item.completed = completed;
    return delay(item, 120);
  },

  async renameSpeakers(meetingId: string, labels: Record<string, string>): Promise<number> {
    const detail = DETAIL[meetingId];
    if (!detail?.transcript) return 0;
    let updated = 0;
    for (const seg of detail.transcript.segments) {
      const next = labels[seg.speaker] ?? labels[seg.speakerName ?? ""];
      if (next) {
        seg.speakerName = next;
        updated++;
      }
    }
    return delay(updated, 100);
  },

  async deleteMeeting(id: string): Promise<boolean> {
    MEETINGS = MEETINGS.filter((m) => m.id !== id);
    delete DETAIL[id];
    return delay(true, 120);
  },
};
