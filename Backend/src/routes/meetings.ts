// Backend/src/routes/meetings.ts

import { FastifyInstance } from "fastify";
import { randomUUID } from "crypto";
import { pipeline } from "stream/promises";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";
import { prisma } from "../db/prisma"; // Import your Prisma client instance
import { processMeetingPipeline } from "../workers/processMeeting"; // Import your background pipeline worker

const allowedAudioExtensions = new Set([".mp3", ".wav", ".m4a"]);

function parseJsonArray(value: string | undefined) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatMeetingDetail(meeting: NonNullable<Awaited<ReturnType<typeof findMeetingDetail>>>) {
  return {
    ...meeting,
    summary: meeting.summary
      ? {
          ...meeting.summary,
          attendees: parseJsonArray(meeting.summary.attendees),
          keyDecisions: parseJsonArray(meeting.summary.keyDecisions),
          discussionPoints: parseJsonArray(meeting.summary.discussionPoints),
          openQuestions: parseJsonArray(meeting.summary.openQuestions),
          nextSteps: parseJsonArray(meeting.summary.nextSteps),
        }
      : null,
  };
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

function sanitizeUploadedFilename(filename: string) {
  return path
    .basename(filename)
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/^_+/, "") || "meeting-audio";
}

export default async function meetingRoutes(
  fastify: FastifyInstance
) {
  // 1. GET ALL MEETINGS
  fastify.get(
    "/meetings",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Get all meetings",
      },
    },
    async () => {
      // Fetch actual meeting records from SQLite ordered by creation time
      const meetings = await prisma.meeting.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });
      return meetings;
    }
  );

  // 2. GET ONE MEETING WITH TRANSCRIPT, SUMMARY, AND ACTION ITEMS
  fastify.get(
    "/meetings/:id",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Get full meeting details",
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

  // 3. ASSIGN REAL NAMES TO SPEAKER LABELS
  fastify.put(
    "/meetings/:id/speakers",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Rename speaker labels for a meeting",
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      const body = request.body as { labels?: Record<string, string> } | undefined;

      if (!body?.labels || typeof body.labels !== "object") {
        return reply.status(400).send({
          error: "Request body must include labels, for example: { labels: { \"Speaker A\": \"Narendra\" } }",
        });
      }

      const meeting = await prisma.meeting.findUnique({
        where: { id },
        include: { transcript: true },
      });

      if (!meeting || !meeting.transcript) {
        return reply.status(404).send({
          error: "Meeting or transcript not found",
        });
      }

      const updates = Object.entries(body.labels)
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

      await prisma.$transaction(
        updates.map((item) =>
          prisma.transcriptSegment.updateMany({
            where: {
              transcriptId: meeting.transcript!.id,
              speaker: item.speaker,
            },
            data: {
              speakerName: item.speakerName,
            },
          })
        )
      );

      const updatedMeeting = await findMeetingDetail(id);
      return formatMeetingDetail(updatedMeeting!);
    }
  );

  // 4. TOGGLE ACTION ITEM COMPLETION
  fastify.put(
    "/meetings/:id/action-items/:itemId",
    {
      schema: {
        tags: ["Meetings"],
        summary: "Update an action item's completion status",
      },
    },
    async (request, reply) => {
      const { id, itemId } = request.params as { id: string; itemId: string };
      const body = request.body as { completed?: boolean } | undefined;

      if (typeof body?.completed !== "boolean") {
        return reply.status(400).send({
          error: "Request body must include a boolean completed value",
        });
      }

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
          completed: body.completed,
        },
      });
    }
  );

  // 5. UPLOAD & INITIALIZE PIPELINE
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

      const meetingId = randomUUID();
      const uploadsDir = "uploads";

      // Ensure directory exists
      await fsPromises.mkdir(uploadsDir, {
        recursive: true,
      });

      const originalFilename = sanitizeUploadedFilename(file.filename);

      if (!allowedAudioExtensions.has(path.extname(originalFilename).toLowerCase())) {
        return reply.status(400).send({
          error: "Unsupported file type. Please upload an .mp3, .wav, or .m4a file.",
        });
      }

      const filename = `${meetingId}-${originalFilename}`;
      const filepath = path.join(uploadsDir, filename);

      // STREAMING OPTIMIZATION: Pipe the inbound file data directly to disk.
      // This prevents the whole file from loading into RAM, making large file uploads safe.
      const writeStream = fs.createWriteStream(filepath);
      await pipeline(file.file, writeStream);

      // Save initial state to the SQLite database
      const newMeeting = await prisma.meeting.create({
        data: {
          id: meetingId,
          filename: originalFilename,
          audioPath: filepath,
          status: "uploaded", // Default initial state
        },
      });

      // FIRE AND FORGET WORKER PIPELINE
      // Do NOT use 'await' here. This lets the server respond immediately to the client 
      // with an "uploaded" status while Groq runs in the background.
      processMeetingPipeline(newMeeting.id, newMeeting.audioPath)
        .catch((err) => fastify.log.error(`Pipeline error for meeting ${meetingId}:`, err));

      return {
        meetingId: newMeeting.id,
        filename: newMeeting.filename,
        status: newMeeting.status,
      };
    }
  );
}
