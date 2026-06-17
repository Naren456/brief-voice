import { api } from "./api";
import type { SearchResult, Meeting } from "@/types";

export const searchService = {
  async query(q: string): Promise<SearchResult[]> {
    const { data } = await api.get<{ query: string; results: any[] }>("/search", {
      params: { q },
    });
    return data.results.map(r => ({
      meeting: { id: r.meetingId, title: r.meetingTitle } as Meeting,
      snippet: r.snippet,
      matchConfidence: Math.round(r.relevanceScore * 100),
      matchedSpeaker: r.speaker || undefined,
      matchedTimestamp: r.startMs || undefined,
    }));
  },
};
