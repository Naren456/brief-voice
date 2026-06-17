import { api } from "./api";
import type { AnalyticsOverview } from "@/types";

export const analyticsService = {
  async overview(): Promise<AnalyticsOverview> {
    const { data } = await api.get<any>("/analytics/overview");
    return {
      meetingVelocityHoursPerWeek: data.totalMeetings || 0,
      velocityChangePercent: 0,
      velocityTrend: [0, 0, 0, 0, 0, 0, 0],
      averageSpeakingClarity: 100,
      actionItemCompletion: data.completionRate || 0,
      completedActionItems: data.completedActionItems || 0,
      meetingFrequency: [],
      keywordHeatmap: [],
      trendingTopics: [],
      bottlenecks: [],
    };
  },
};
