import { api } from "./api";
import type { AnalyticsOverview } from "@/types";

export const analyticsService = {
  async overview(): Promise<AnalyticsOverview> {
    const { data } = await api.get<AnalyticsOverview>("/analytics/overview");
    return data;
  },
};
