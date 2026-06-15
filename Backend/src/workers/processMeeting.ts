// Backend/src/workers/processMeeting.ts

import { prisma } from "../db/prisma";
import { transcribeAudio } from "../services/assemblyai.service";
// Switch out Gemini service reference for our newly built OpenAI engine module
import { generateSummary, extractActionItems } from "../services/openai.service";

type MeetingPipelinePrismaClient = typeof prisma & {
  actionItem: {
    deleteMany: (args: { where: { meetingId: string } }) => Promise<unknown>;
    createMany: (args: {
      data: Array<{
        meetingId: string;
        task: string;
        owner: string | null;
        deadline: string | null;
        completed: boolean;
      }>;
    }) => Promise<unknown>;
  };
  meetingSummary: {
    deleteMany: (args: { where: { meetingId: string } }) => Promise<unknown>;
    create: (args: {
      data: {
        meetingId: string;
        attendees: string;
        keyDecisions: string;
        discussionPoints: string;
        openQuestions: string;
        nextSteps: string;
      };
    }) => Promise<unknown>;
  };
  transcript: {
    deleteMany: (args: { where: { meetingId: string } }) => Promise<unknown>;
    create: (args: {
      data: {
        meetingId: string;
        fullText: string;
      };
    }) => Promise<{ id: string }>;
  };
  transcriptSegment: {
    createMany: (args: {
      data: Array<{
        transcriptId: string;
        speaker: string;
        text: string;
        startMs: number;
        endMs: number;
      }>;
    }) => Promise<unknown>;
  };
};

const pipelinePrisma = prisma as MeetingPipelinePrismaClient;

/**
 * Handles the async transcription and AI processing pipeline process.
 */
export async function processMeetingPipeline(meetingId: string, filePath: string) {
  try {
    // 1. Update master meeting entry status to processing
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "processing" },
    });

    // Make retries safe if a previous run partially wrote derived records.
    await pipelinePrisma.actionItem.deleteMany({ where: { meetingId } });
    await pipelinePrisma.meetingSummary.deleteMany({ where: { meetingId } });
    await pipelinePrisma.transcript.deleteMany({ where: { meetingId } });

    console.log(`[Worker] Step 1: Ingesting audio through AssemblyAI for: ${meetingId}`);
    const { fullText, segments } = await transcribeAudio(filePath);
    
    // 2. Persist the transcript core records and chronological segments to SQLite
    console.log(`[Worker] Step 2: Saving transcript data to database...`);
    const savedTranscript = await pipelinePrisma.transcript.create({
      data: {
        meetingId: meetingId,
        fullText: fullText,
      }
    });

    if (segments.length > 0) {
      await pipelinePrisma.transcriptSegment.createMany({
        data: segments.map((seg) => ({
          transcriptId: savedTranscript.id,
          speaker: seg.speaker,
          text: seg.text,
          startMs: seg.startMs,
          endMs: seg.endMs,
        })),
      });
    }

    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "transcribed" },
    });

    // 3. Extract unique historical speakers for context injection
    const uniqueSpeakers = Array.from(new Set(segments.map((s) => s.speaker)));

    console.log(`[Worker] Step 3: Triggering OpenAI structured summary synthesis...`);
    const summaryData = await generateSummary(fullText, uniqueSpeakers);

    // Save summary text data objects to SQLite
    await pipelinePrisma.meetingSummary.create({
      data: {
        meetingId: meetingId,
        attendees: JSON.stringify(summaryData.attendees),
        keyDecisions: JSON.stringify(summaryData.keyDecisions),
        discussionPoints: JSON.stringify(summaryData.discussionPoints),
        openQuestions: JSON.stringify(summaryData.openQuestions),
        nextSteps: JSON.stringify(summaryData.nextSteps),
      },
    });

    console.log(`[Worker] Step 4: Extracting interactive action items checklists via OpenAI...`);
    const actionItemsData = await extractActionItems(fullText);

    if (actionItemsData.length > 0) {
      await pipelinePrisma.actionItem.createMany({
        data: actionItemsData.map((item) => ({
          meetingId: meetingId,
          task: item.task,
          owner: item.owner,
          deadline: item.deadline,
          completed: false, 
        })),
      });
    }

    // 5. SUCCESS! Finalize pipeline lifecycle flag to processed
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "processed" },
    });

    console.log(`[Worker] Pipeline finished successfully via OpenAI for meeting ${meetingId}!`);

  } catch (error) {
    console.error(`[Worker Operational Error] Processing failed for meeting ${meetingId}:`, error);
    
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: "error" },
    }).catch((dbErr) => console.error(`[Worker Error] Failed to write error state to database:`, dbErr));
  }
}
