import { prisma } from "../db/prisma";

function roundPercent(value: number) {
  return Math.round(value * 100) / 100;
}

export async function getAnalyticsOverview() {
  const [totalMeetings, totalActionItems, completedActionItems] = await Promise.all([
    prisma.meeting.count(),
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
    totalActionItems,
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

  const speakingTimeBySpeaker = Array.from(speakerDurations.entries()).map(
    ([speaker, speakingTimeMs]) => ({
      speaker,
      speakingTimeMs,
      speakingTimeSeconds: roundPercent(speakingTimeMs / 1000),
      percentage:
        totalSpeakingTimeMs === 0
          ? 0
          : roundPercent((speakingTimeMs / totalSpeakingTimeMs) * 100),
    })
  );

  return {
    meetingId: meeting.id,
    filename: meeting.filename,
    status: meeting.status,
    totalSpeakingTimeMs,
    totalSpeakingTimeSeconds: roundPercent(totalSpeakingTimeMs / 1000),
    speakingTimeBySpeaker,
  };
}
