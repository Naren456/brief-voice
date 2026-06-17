import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { prisma } from "../db/prisma";
import { processMeetingPipeline } from "../workers/processMeeting";
import { deleteMeetingEmbeddings } from "../services/search.service";
import { generatePDFReport, PDFReportError } from "../services/pdf.service";
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

function computeMeetingMetrics(meeting: any) {
  const segments = meeting.transcript?.segments || [];
  const durationMs = segments.length > 0 ? Math.max(...segments.map((s: any) => s.endMs)) : 0;
  const speakers = new Set(segments.map((s: any) => s.speaker));
  const actionItems = meeting.actionItems || [];
  
  let summarySnippet = undefined;
  if (meeting.summary?.discussionPoints) {
    const pts = parseJsonArray(meeting.summary.discussionPoints);
    if (pts.length > 0) summarySnippet = pts[0];
  }

  return {
    title: meeting.filename.replace(/\.[a-z0-9]+$/i, ""),
    durationMs,
    speakerCount: speakers.size,
    actionItemCount: actionItems.length,
    summarySnippet,
  };
}

function formatMeetingDetail(meeting: NonNullable<Awaited<ReturnType<typeof findMeetingDetail>>>) {
  const metrics = computeMeetingMetrics(meeting);
  
  // Calculate speaking time breakdown
  const segments = meeting.transcript?.segments || [];
  const speakerTimes: Record<string, number> = {};
  for (const seg of segments) {
    const dur = seg.endMs - seg.startMs;
    speakerTimes[seg.speaker] = (speakerTimes[seg.speaker] || 0) + dur;
  }
  
  const totalSpeakingMs = Object.values(speakerTimes).reduce((a, b) => a + b, 0);
  const speakingTime = Object.entries(speakerTimes).map(([speaker, ms]) => ({
    speaker,
    ms,
    percent: totalSpeakingMs > 0 ? (ms / totalSpeakingMs) * 100 : 0
  })).sort((a, b) => b.ms - a.ms);

  return {
    id: meeting.id,
    filename: meeting.filename,
    title: metrics.title,
    status: meeting.status,
    createdAt: meeting.createdAt,
    durationMs: metrics.durationMs,
    speakerCount: metrics.speakerCount,
    actionItemCount: metrics.actionItemCount,
    summarySnippet: metrics.summarySnippet,
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
    speakingTime,
    keywordFrequency: [] // Keyword extraction isn't implemented in backend MVP, return empty to prevent crashes
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

function safeDownloadFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
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
      const meetings = await prisma.meeting.findMany({
        orderBy: {
          createdAt: "desc",
        },
        include: {
          transcript: { include: { segments: true } },
          summary: true,
          actionItems: true,
        }
      });

      return meetings.map(m => {
        const metrics = computeMeetingMetrics(m);
        return {
          id: m.id,
          filename: m.filename,
          title: metrics.title,
          status: m.status,
          createdAt: m.createdAt,
          durationMs: metrics.durationMs,
          speakerCount: metrics.speakerCount,
          actionItemCount: metrics.actionItemCount,
          summarySnippet: metrics.summarySnippet,
        };
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
        const reportFilename = safeDownloadFilename(`meeting-${id}-report.pdf`);

        return reply
          .header("Content-Type", "application/pdf")
          .header("Content-Disposition", `attachment; filename="${reportFilename}"`)
          .send(pdf);
      } catch (error) {
        if (error instanceof PDFReportError) {
          return reply.status(error.statusCode).send({
            error: error.message,
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
