import { prisma } from "../db/prisma";

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

export interface SpeakingTimeEntry {
  speaker: string;
  totalMs: number;
}

export interface MeetingAnalytics {
  meetingId: string;
  totalDurationMs: number;
  speakingTime: SpeakingTimeEntry[];
}

export interface OverviewStats {
  totalMeetings: number;
  processedMeetings: number;
  totalActionItems: number;
  completedItems: number;
  completedActionItems: number;
  completionRate: number;
}

export async function getAnalyticsOverview(): Promise<OverviewStats> {
  const [totalMeetings, processedMeetings, totalActionItems, completedActionItems] =
    await Promise.all([
      prisma.meeting.count(),
      prisma.meeting.count({
        where: {
          status: "processed",
        },
      }),
      prisma.actionItem.count(),
      prisma.actionItem.count({
        where: {
          completed: true,
        },
      }),
    ]);

  const completionRate =
    totalActionItems === 0 ? 0 : roundPercent((completedActionItems / totalActionItems) * 100);

  return {
    totalMeetings,
    processedMeetings,
    totalActionItems,
    completedItems: completedActionItems,
    completedActionItems,
    completionRate,
  };
}

export async function getMeetingAnalytics(meetingId: string) {
  const meeting = await prisma.meeting.findUnique({
    where: {
      id: meetingId,
    },
    include: {
      transcript: {
        include: {
          segments: true,
        },
      },
    },
  });

  if (!meeting) {
    return null;
  }

  const speakerDurations = new Map<string, number>();

  for (const segment of meeting.transcript?.segments ?? []) {
    const speaker = segment.speakerName || segment.speaker;
    const durationMs = Math.max(segment.endMs - segment.startMs, 0);
    speakerDurations.set(speaker, (speakerDurations.get(speaker) ?? 0) + durationMs);
  }

  const totalSpeakingTimeMs = Array.from(speakerDurations.values()).reduce(
    (total, duration) => total + duration,
    0
  );

  const speakingTimeBySpeaker = Array.from(speakerDurations.entries())
    .map(([speaker, speakingTimeMs]) => ({
      speaker,
      speakingTimeMs,
      speakingTimeSeconds: roundPercent(speakingTimeMs / 1000),
      percentage:
        totalSpeakingTimeMs === 0
          ? 0
          : roundPercent((speakingTimeMs / totalSpeakingTimeMs) * 100),
    }))
    .sort((a, b) => b.speakingTimeMs - a.speakingTimeMs);

  return {
    meetingId: meeting.id,
    filename: meeting.filename,
    status: meeting.status,
    totalSpeakingTimeMs,
    totalSpeakingTimeSeconds: roundPercent(totalSpeakingTimeMs / 1000),
    speakingTimeBySpeaker,
    speakingTime: speakingTimeBySpeaker.map((entry) => ({
      speaker: entry.speaker,
      totalMs: entry.speakingTimeMs,
    })),
  };
}

export async function getSpeakingTime(meetingId: string): Promise<MeetingAnalytics> {
  const analytics = await getMeetingAnalytics(meetingId);

  return {
    meetingId,
    totalDurationMs: analytics?.totalSpeakingTimeMs ?? 0,
    speakingTime:
      analytics?.speakingTimeBySpeaker.map((entry) => ({
        speaker: entry.speaker,
        totalMs: entry.speakingTimeMs,
      })) ?? [],
  };
}

export async function getOverviewStats(): Promise<OverviewStats> {
  return getAnalyticsOverview();
}
