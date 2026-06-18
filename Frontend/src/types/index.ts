export type MeetingStatus =
  | "uploaded"
  | "processing"
  | "transcribing"
  | "summarizing"
  | "processed"
  | "ready"
  | "failed";

export interface TranscriptSegment {
  id: string;
  startMs: number;
  endMs: number;
  speaker: string;
  speakerName?: string | null;
  text: string;
}

export interface Transcript {
  fullText: string;
  segments: TranscriptSegment[];
}

export interface Summary {
  attendees: string[];
  keyDecisions: string[];
  discussionPoints: string[];
  openQuestions: string[];
  nextSteps: string[];
}

export interface ActionItem {
  id: string;
  task: string;
  owner: string;
  deadline?: string | null;
  completed: boolean;
  priority?: "low" | "medium" | "high";
}

export interface Meeting {
  id: string;
  filename: string;
  title: string;
  category?: string;
  status: MeetingStatus;
  createdAt: string;
  durationMs: number;
  speakerCount: number;
  actionItemCount: number;
  summarySnippet?: string;
  matchConfidence?: number;
  pinned?: boolean;
}

export interface MeetingDetail extends Meeting {
  transcript: Transcript | null;
  summary: Summary | null;
  actionItems: ActionItem[];
  speakingTime: { speaker: string; ms: number; percent: number }[];
  keywordFrequency: { keyword: string; count: number }[];
}

export interface SearchResult {
  meeting: Meeting;
  snippet: string;
  matchConfidence: number;
  matchedSpeaker?: string;
  matchedTimestamp?: number;
}

export interface AnalyticsOverview {
  meetingVelocityHoursPerWeek: number;
  velocityChangePercent: number;
  velocityTrend: number[];
  averageSpeakingClarity: number;
  actionItemCompletion: number;
  completedActionItems: number;
  meetingFrequency: {
    label: string;
    engineering: number;
    product: number;
  }[];
  keywordHeatmap: { keyword: string; values: number[] }[];
  trendingTopics: { topic: string; state: "trending" | "stable" | "emerging" }[];
  bottlenecks: {
    id: string;
    severity: "warning" | "positive";
    title: string;
    description: string;
    ageHours: number;
  }[];
}

export interface UploadInitResponse {
  meetingId: string;
  filename: string;
  status: MeetingStatus;
}

export type PipelineStage =
  | "transmitted"
  | "diarization"
  | "transcription"
  | "summary"
  | "actionItems"
  | "indexed";

export interface PipelineStep {
  id: PipelineStage;
  label: string;
  description: string;
  status: "pending" | "active" | "complete" | "failed";
}
