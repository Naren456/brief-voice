import type {
  ActionItem,
  AnalyticsOverview,
  Meeting,
  MeetingDetail,
  SearchResult,
  Summary,
  Transcript,
} from "@/types";

const ISO = (daysAgo: number) =>
  new Date(Date.now() - daysAgo * 86400000).toISOString();

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: "m_001",
    filename: "q3_infrastructure_prisma.mp3",
    title: "Q3 Infrastructure & Prisma Migrations",
    category: "Architecture Sync",
    status: "ready",
    createdAt: ISO(2),
    durationMs: 28 * 60_000 + 12_000,
    speakerCount: 6,
    actionItemCount: 4,
    summarySnippet:
      "Narendra confirmed the move to zero-downtime Prisma migrations using shadow databases during Q4 rollout.",
    matchConfidence: 0.94,
  },
  {
    id: "m_002",
    filename: "mobile_app_ux_review_v2_1.m4a",
    title: "Mobile App UX Review: V2.1",
    category: "Product Roadmap",
    status: "ready",
    createdAt: ISO(4),
    durationMs: 41 * 60_000,
    speakerCount: 3,
    actionItemCount: 12,
    summarySnippet:
      "Discussed bottom navigation changes and accessibility improvements for V2.1.",
    pinned: true,
  },
  {
    id: "m_003",
    filename: "q4_financial_projections.wav",
    title: "Q4 Financial Projections",
    category: "Board Meeting",
    status: "ready",
    createdAt: ISO(11),
    durationMs: 56 * 60_000,
    speakerCount: 8,
    actionItemCount: 3,
    summarySnippet: "Growth forecast updated for AI integrations and infra spend.",
  },
  {
    id: "m_004",
    filename: "sprint_42_core_engine.mp3",
    title: "Core Engine Refactor: Sprint 42",
    category: "Sprint Planning",
    status: "ready",
    createdAt: ISO(16),
    durationMs: 47 * 60_000,
    speakerCount: 5,
    actionItemCount: 22,
    summarySnippet:
      "Cleanup of legacy websocket logic and migration to event-stream protocol.",
  },
  {
    id: "m_005",
    filename: "sarah_l_interview.mp3",
    title: "Senior AI Engineer Interview: Sarah L.",
    category: "Hiring",
    status: "ready",
    createdAt: ISO(18),
    durationMs: 52 * 60_000,
    speakerCount: 2,
    actionItemCount: 1,
    summarySnippet:
      "Strong technical background in LLM fine-tuning and retrieval pipelines.",
  },
  {
    id: "m_006",
    filename: "weekly_sync_q3.mp3",
    title: "Weekly Sync — Q3 Strategy",
    category: "Leadership",
    status: "ready",
    createdAt: ISO(23),
    durationMs: 28 * 60_000 + 12_000,
    speakerCount: 4,
    actionItemCount: 7,
    summarySnippet:
      "Aligned go-to-market for the AI-first intelligence pivot. Locked Nov 15 release.",
  },
  {
    id: "m_007",
    filename: "design_critique_oct.mp3",
    title: "Design Critique — October Wave",
    category: "Design",
    status: "ready",
    createdAt: ISO(27),
    durationMs: 36 * 60_000,
    speakerCount: 5,
    actionItemCount: 9,
    summarySnippet:
      "Refined density rules across dashboards. Locked typography pairing.",
  },
  {
    id: "m_008",
    filename: "customer_feedback_panel.m4a",
    title: "Customer Feedback Panel — Q3",
    category: "User Feedback",
    status: "ready",
    createdAt: ISO(32),
    durationMs: 64 * 60_000,
    speakerCount: 9,
    actionItemCount: 14,
    summarySnippet:
      "Pricing dissatisfaction surfaced from mid-market segment. Two retention asks logged.",
  },
];

const SUMMARY_FOR_M001: Summary = {
  attendees: ["Ritesh", "Narendra", "Harshita", "Mohit"],
  keyDecisions: [
    "Proceed with AI-first transition for the core intelligence model.",
    "Approve November release timeline pending API quota increase.",
    "Adopt zero-downtime Prisma migrations using shadow databases.",
  ],
  discussionPoints: [
    "Team discussed the 40% engagement boost observed in beta trials.",
    "Focus on ensuring low-latency real-time extraction.",
    "Backend infrastructure needs to scale for increased processing.",
  ],
  openQuestions: [
    "Will the current pricing model cover the additional AI processing costs?",
    "Can we implement a fallback for the transcription engine?",
    "Is the UI ready for higher information density?",
  ],
  nextSteps: [
    "Request API quota increase by Oct 26.",
    "Latency stress test for backend by Nov 1.",
    "UX density review by Nov 5.",
  ],
};

const ACTION_ITEMS_M001: ActionItem[] = [
  {
    id: "a_01",
    task: "Request API quota increase",
    owner: "Narendra",
    deadline: ISO(-1),
    completed: false,
    priority: "high",
  },
  {
    id: "a_02",
    task: "Latency stress test for backend",
    owner: "Dev Team",
    deadline: ISO(-6),
    completed: false,
    priority: "medium",
  },
  {
    id: "a_03",
    task: "Draft compliance memo for AI processing costs",
    owner: "Harshita",
    deadline: ISO(-3),
    completed: true,
    priority: "low",
  },
  {
    id: "a_04",
    task: "UX density review sweep",
    owner: "Mohit",
    deadline: ISO(-10),
    completed: false,
    priority: "medium",
  },
];

const TRANSCRIPT_M001: Transcript = {
  fullText: "",
  segments: [
    {
      id: "s_01",
      startMs: 5_000,
      endMs: 28_000,
      speaker: "SPEAKER_0",
      speakerName: "Ritesh",
      text: "Welcome everyone to the Q3 strategy sync. We've got a lot to cover today, specifically our transition toward the AI-first intelligence model for the core platform.",
    },
    {
      id: "s_02",
      startMs: 185_000,
      endMs: 240_000,
      speaker: "SPEAKER_1",
      speakerName: "Narendra",
      text: "I agree with Ritesh. The data from the beta shows a 40% uptick in user engagement when we surface the “Action Item” chips automatically in the transcript.",
    },
    {
      id: "s_03",
      startMs: 252_000,
      endMs: 296_000,
      speaker: "SPEAKER_0",
      speakerName: "Ritesh",
      text: "That's a significant jump. Let's ensure the backend can handle the latency for real-time extraction. Are there any potential blockers for the November release?",
    },
    {
      id: "s_04",
      startMs: 345_000,
      endMs: 388_000,
      speaker: "SPEAKER_1",
      speakerName: "Narendra",
      text: "Mainly the API rate limits on the transcription engine, but we've already requested a quota increase from the provider.",
    },
    {
      id: "s_05",
      startMs: 412_000,
      endMs: 470_000,
      speaker: "SPEAKER_2",
      speakerName: "Harshita",
      text: "From a compliance standpoint we need to ensure session token handling complies with the new requirements. I'll draft a memo by next week.",
    },
    {
      id: "s_06",
      startMs: 522_000,
      endMs: 588_000,
      speaker: "SPEAKER_3",
      speakerName: "Mohit",
      text: "On the UX side, we're testing a higher density layout that surfaces decisions inline. The 40% engagement boost held up across the secondary cohort too.",
    },
    {
      id: "s_07",
      startMs: 642_000,
      endMs: 712_000,
      speaker: "SPEAKER_0",
      speakerName: "Ritesh",
      text: "Great. Let's lock the Nov 15 release pending quota approval. Narendra owns the request, dev team owns the stress test, Harshita owns compliance.",
    },
  ],
};

export const MOCK_MEETING_DETAIL: Record<string, MeetingDetail> = {
  m_001: {
    ...MOCK_MEETINGS[0],
    transcript: TRANSCRIPT_M001,
    summary: SUMMARY_FOR_M001,
    actionItems: ACTION_ITEMS_M001,
    speakingTime: [
      { speaker: "Ritesh", ms: 11.2 * 60_000, percent: 39.7 },
      { speaker: "Narendra", ms: 9.45 * 60_000, percent: 33.5 },
      { speaker: "Harshita", ms: 4.05 * 60_000, percent: 14.4 },
      { speaker: "Mohit", ms: 3.5 * 60_000, percent: 12.4 },
    ],
    keywordFrequency: [
      { keyword: "Prisma", count: 14 },
      { keyword: "Migration", count: 11 },
      { keyword: "Quota", count: 9 },
      { keyword: "AI-first", count: 8 },
      { keyword: "Compliance", count: 6 },
      { keyword: "Engagement", count: 5 },
    ],
  },
};

// Build lightweight detail records for every mock meeting so detail routes work.
for (const m of MOCK_MEETINGS) {
  if (MOCK_MEETING_DETAIL[m.id]) continue;
  MOCK_MEETING_DETAIL[m.id] = {
    ...m,
    transcript: {
      fullText: "",
      segments: TRANSCRIPT_M001.segments.map((s) => ({ ...s })),
    },
    summary: SUMMARY_FOR_M001,
    actionItems: ACTION_ITEMS_M001.map((a) => ({ ...a })),
    speakingTime: [
      { speaker: "Speaker A", ms: 14 * 60_000, percent: 48 },
      { speaker: "Speaker B", ms: 9 * 60_000, percent: 31 },
      { speaker: "Speaker C", ms: 6 * 60_000, percent: 21 },
    ],
    keywordFrequency: [
      { keyword: "Roadmap", count: 11 },
      { keyword: "Velocity", count: 7 },
      { keyword: "Pricing", count: 5 },
      { keyword: "Hiring", count: 4 },
    ],
  };
}

export const MOCK_SEARCH_RESULTS = (q: string): SearchResult[] => {
  const norm = q.trim().toLowerCase();
  return MOCK_MEETINGS.map((m, i) => ({
    meeting: m,
    snippet: m.summarySnippet ?? "",
    matchConfidence: Math.max(0.42, 0.95 - i * 0.07),
    matchedSpeaker: i % 2 === 0 ? "Narendra K." : "Ritesh",
    matchedTimestamp: 185_000 + i * 12_000,
  })).filter((r) =>
    norm ? (r.meeting.title + r.snippet).toLowerCase().includes(norm) : true,
  );
};

export const MOCK_ANALYTICS: AnalyticsOverview = {
  meetingVelocityHoursPerWeek: 42.8,
  velocityChangePercent: 12.5,
  velocityTrend: [4, 6, 5, 8, 7, 4],
  averageSpeakingClarity: 94.2,
  actionItemCompletion: 87,
  completedActionItems: 1204,
  meetingFrequency: [
    { label: "Oct 01", engineering: 12, product: 6 },
    { label: "Oct 04", engineering: 18, product: 8 },
    { label: "Oct 08", engineering: 14, product: 11 },
    { label: "Oct 11", engineering: 21, product: 10 },
    { label: "Oct 15", engineering: 16, product: 13 },
    { label: "Oct 18", engineering: 26, product: 14 },
    { label: "Oct 22", engineering: 22, product: 17 },
    { label: "Oct 25", engineering: 31, product: 20 },
    { label: "Oct 29", engineering: 27, product: 22 },
  ],
  keywordHeatmap: [
    { keyword: "Microservices", values: [3, 1, 4, 5, 2, 5, 4] },
    { keyword: "Q4 Roadmap", values: [2, 3, 2, 3, 4, 3, 2] },
    { keyword: "Edge Runtime", values: [1, 2, 3, 2, 4, 5, 5] },
    { keyword: "Prisma", values: [0, 1, 3, 4, 5, 5, 4] },
    { keyword: "Pricing", values: [4, 3, 2, 1, 1, 2, 3] },
  ],
  trendingTopics: [
    { topic: "Microservices", state: "trending" },
    { topic: "Q4 Roadmap", state: "stable" },
    { topic: "Edge Runtime", state: "emerging" },
    { topic: "AI-first Pivot", state: "trending" },
  ],
  bottlenecks: [
    {
      id: "b_01",
      severity: "warning",
      title: "Decision Paralysis in Sprint Planning",
      description:
        "System detected a 42-minute tangent on 'infrastructure scalability' already resolved in the previous Architecture Review.",
      ageHours: 2,
    },
    {
      id: "b_02",
      severity: "positive",
      title: "High-Clarity Leadership Sync",
      description:
        "Executive Sync achieved a clarity score of 98.2%. Highly optimistic regarding the H2 expansion.",
      ageHours: 5,
    },
  ],
};
