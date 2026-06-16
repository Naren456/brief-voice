import { FastifyInstance } from "fastify";
import {
  getAnalyticsOverview,
  getMeetingAnalytics,
  getOverviewStats,
  getSpeakingTime,
} from "../services/analytics.service";
import { MeetingParamsSchema } from "../schemas/meeting";

export default async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/analytics",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Dashboard analytics overview",
      },
    },
    async () => {
      return getAnalyticsOverview();
    }
  );

  fastify.get(
    "/analytics/overview",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Get overall meeting analytics",
      },
    },
    async () => {
      return getOverviewStats();
    }
  );

  fastify.get(
    "/analytics/meeting/:id",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Get speaking-time analytics for one meeting",
        params: MeetingParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const analytics = await getMeetingAnalytics(id);

      if (!analytics) {
        return reply.status(404).send({
          error: "Meeting not found",
        });
      }

      return analytics;
    }
  );

  fastify.get(
    "/analytics/meeting/:id/speaking-time",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Speaking time per speaker for one meeting",
        params: MeetingParamsSchema,
      },
    },
    async (request) => {
      const { id } = request.params as { id: string };
      return getSpeakingTime(id);
    }
  );
}
