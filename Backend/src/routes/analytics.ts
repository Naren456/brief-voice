import { FastifyInstance } from "fastify";
import { getAnalyticsOverview, getMeetingAnalytics } from "../services/analytics.service";

export default async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/analytics/overview",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Get overall meeting analytics",
      },
    },
    async () => {
      return getAnalyticsOverview();
    }
  );

  fastify.get(
    "/analytics/meeting/:id",
    {
      schema: {
        tags: ["Analytics"],
        summary: "Get speaking-time analytics for one meeting",
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
}
