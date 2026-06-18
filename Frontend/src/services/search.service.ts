import { api } from "./api";
import type { SearchResult } from "@/types";

export const searchService = {
  async query(q: string): Promise<SearchResult[]> {
    const { data } = await api.get<{ query: string; results: any[] }>("/search", {
      params: { q },
    });
    return data.results.map((r) => ({
      meeting: {
        id: r.meetingId ?? r.id ?? "",
        filename: r.filename ?? "",
        title: r.meetingTitle ?? r.title ?? "Untitled Meeting",
        category: r.category ?? undefined,
        status: r.status ?? "processed",
        createdAt: r.createdAt ?? new Date().toISOString(),
        durationMs: r.durationMs ?? 0,
        speakerCount: r.speakerCount ?? 0,
        actionItemCount: r.actionItemCount ?? 0,
        summarySnippet: r.snippet ?? r.summarySnippet ?? undefined,
        matchConfidence: r.relevanceScore ?? undefined,
        pinned: false,
      },
      snippet: r.snippet ?? "",
      matchConfidence: r.relevanceScore ?? 0,
      matchedSpeaker: r.speaker ?? undefined,
      matchedTimestamp: r.startMs ?? undefined,
    }));
  },
};
