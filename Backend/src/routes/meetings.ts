import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { prisma } from "../db/prisma";
import { processMeetingPipeline } from "../workers/processMeeting";
import { deleteMeetingEmbeddings } from "../services/search.service";
import { generatePDFReport } from "../services/pdf.service";
import {
  MeetingParamsSchema,
  SpeakerLabelsSchema,
  ActionItemParamsSchema,
  ActionItemToggleSchema,
  ALLOWED_AUDIO_EXTENSIONS,
} from "../schemas/meeting";

function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function findMeetingDetail(id: string) {
  return prisma.meeting.findUnique({
    where: { id },
    include: {
      transcript: {
        include: {
          segments: {
            orderBy: {
              startMs: "asc",
            },
          },
        },
      },
      summary: true,
      actionItems: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
}

function formatMeetingDetail(meeting: NonNullable<Awaited<ReturnType<typeof findMeetingDetail>>>) {
  return {
    id: meeting.id,
    filename: meeting.filename,
    status: meeting.status,
    createdAt: meeting.createdAt,
    transcript: meeting.transcript
      ? {
          fullText: meeting.transcript.fullText,
          segments: meeting.transcript.segments,
        }
      : null,
    summary: meeting.summary
      ? {
          attendees: parseJsonArray(meeting.summary.attendees),
          keyDecisions: parseJsonArray(meeting.summary.keyDecisions),
          discussionPoints: parseJsonArray(meeting.summary.discussionPoints),
          openQuestions: parseJsonArray(meeting.summary.openQuestions),
          nextSteps: parseJsonArray(meeting.summary.nextSteps),
        }
      : null,
    actionItems: meeting.actionItems,
  };
}

function sanitizeUploadedFilename(filename: string) {
  return (
    path
      .basename(filename)
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/^_+/, "") || "meeting-audio"
  );
}

export default async function meetingRoutes(fastify: FastifyInstance) {
  fastify.get(
    "/meetings",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Get all meetings",
      },
    },
    async () => {
      return prisma.meeting.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
    }
  );

  fastify.get(
    "/meetings/:id/report",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Download meeting PDF report",
        params: MeetingParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      try {
        const pdf = await generatePDFReport(id);

        return reply
          .header("Content-Type", "application/pdf")
          .header("Content-Disposition", `attachment; filename="meeting-${id}-report.pdf"`)
          .send(pdf);
      } catch (error) {
        if (error instanceof Error && error.message === "Meeting not found") {
          return reply.status(404).send({
            error: "Meeting not found",
          });
        }

        throw error;
      }
    }
  );

  fastify.get(
    "/meetings/:id",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Get full meeting details",
        params: MeetingParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const meeting = await findMeetingDetail(id);

      if (!meeting) {
        return reply.status(404).send({
          error: "Meeting not found",
        });
      }

      return formatMeetingDetail(meeting);
    }
  );

  fastify.put(
    "/meetings/:id/speakers",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Assign real names to speaker labels",
        params: MeetingParamsSchema,
        body: SpeakerLabelsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const { labels } = request.body as { labels: Record<string, string> };

      const transcript = await prisma.transcript.findUnique({
        where: { meetingId: id },
      });

      if (!transcript) {
        return reply.status(404).send({
          error: "Transcript not found for this meeting",
        });
      }

      const updates = Object.entries(labels)
        .map(([speaker, speakerName]) => ({
          speaker,
          speakerName: String(speakerName).trim(),
        }))
        .filter((item) => item.speaker && item.speakerName);

      if (updates.length === 0) {
        return reply.status(400).send({
          error: "At least one non-empty speaker label and name is required",
        });
      }

      const results = await prisma.$transaction(
        updates.map((item) =>
          prisma.transcriptSegment.updateMany({
            where: {
              transcriptId: transcript.id,
              speaker: item.speaker,
            },
            data: {
              speakerName: item.speakerName,
            },
          })
        )
      );

      return {
        updatedSegments: results.reduce((total, result) => total + result.count, 0),
      };
    }
  );

  fastify.put(
    "/meetings/:id/action-items/:itemId",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Toggle action item completion",
        params: ActionItemParamsSchema,
        body: ActionItemToggleSchema,
      },
    },
    async (request, reply) => {
      const { id, itemId } = request.params as { id: string; itemId: string };
      const { completed } = request.body as { completed: boolean };

      const actionItem = await prisma.actionItem.findFirst({
        where: {
          id: itemId,
          meetingId: id,
        },
      });

      if (!actionItem) {
        return reply.status(404).send({
          error: "Action item not found for this meeting",
        });
      }

      return prisma.actionItem.update({
        where: {
          id: itemId,
        },
        data: {
          completed,
        },
      });
    }
  );

  fastify.post(
    "/meetings/upload",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Upload meeting audio",
      },
    },
    async (request, reply) => {
      const file = await request.file();

      if (!file) {
        return reply.status(400).send({
          error: "No file uploaded",
        });
      }

      const originalFilename = sanitizeUploadedFilename(file.filename);
      const ext = path.extname(originalFilename).toLowerCase();

      if (!ALLOWED_AUDIO_EXTENSIONS.includes(ext as (typeof ALLOWED_AUDIO_EXTENSIONS)[number])) {
        return reply.status(400).send({
          error: `Unsupported file type "${ext || "unknown"}". Allowed: ${ALLOWED_AUDIO_EXTENSIONS.join(", ")}`,
        });
      }

      const meetingId = randomUUID();
      const uploadsDir = "uploads";
      await fsPromises.mkdir(uploadsDir, {
        recursive: true,
      });

      const filename = `${meetingId}-${originalFilename}`;
      const filepath = path.join(uploadsDir, filename);

      const writeStream = fs.createWriteStream(filepath);
      try {
        await pipeline(file.file, writeStream);
      } catch (err) {
        await fsPromises.unlink(filepath).catch(() => {});
        throw err;
      }

      if (file.file.truncated) {
        await fsPromises.unlink(filepath).catch(() => {});
        return reply.status(400).send({
          error: "File exceeds the maximum allowed size.",
        });
      }

      const stats = await fsPromises.stat(filepath);
      if (stats.size === 0) {
        await fsPromises.unlink(filepath).catch(() => {});
        return reply.status(400).send({
          error: "Uploaded file is empty.",
        });
      }

      const newMeeting = await prisma.meeting.create({
        data: {
          id: meetingId,
          filename: originalFilename,
          audioPath: filepath,
          status: "uploaded",
        },
      });

      processMeetingPipeline(newMeeting.id, newMeeting.audioPath).catch((err) =>
        fastify.log.error(`Pipeline error for meeting ${meetingId}:`, err)
      );

      return {
        meetingId: newMeeting.id,
        filename: newMeeting.filename,
        status: newMeeting.status,
      };
    }
  );

  fastify.delete(
    "/meetings/:id",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Delete a meeting and its derived data",
        params: MeetingParamsSchema,
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };

      const meeting = await prisma.meeting.findUnique({
        where: {
          id,
        },
      });

      if (!meeting) {
        return reply.status(404).send({
          error: "Meeting not found",
        });
      }

      await deleteMeetingEmbeddings(id).catch((err) =>
        fastify.log.error(`Failed to delete embeddings for ${id}:`, err)
      );

      await prisma.meeting.delete({
        where: {
          id,
        },
      });

      if (meeting.audioPath) {
        await fsPromises.unlink(meeting.audioPath).catch(() => {});
      }

      return reply.status(200).send({
        deleted: true,
        id,
      });
    }
  );
}
