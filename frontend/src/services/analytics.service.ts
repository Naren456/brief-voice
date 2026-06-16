import { api, USE_MOCK_API } from "./api";
import { mockAdapter } from "./mock.adapter";
import type { AnalyticsOverview } from "@/types";

export const analyticsService = {
  async overview(): Promise<AnalyticsOverview> {
    if (USE_MOCK_API) return mockAdapter.getAnalytics();
    const { data } = await api.get<AnalyticsOverview>("/analytics");
    return data;
  },
};
