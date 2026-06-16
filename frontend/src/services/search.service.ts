import { api, USE_MOCK_API } from "./api";
import { mockAdapter } from "./mock.adapter";
import type { SearchResult } from "@/types";

export const searchService = {
  async query(q: string): Promise<SearchResult[]> {
    if (USE_MOCK_API) return mockAdapter.search(q);
    const { data } = await api.post<SearchResult[]>("/search", { query: q });
    return data;
  },
};
