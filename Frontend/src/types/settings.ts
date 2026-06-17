export type Theme = "dark" | "system";
export type AccentColor = "indigo" | "purple" | "emerald" | "blue";
export type Density = "compact" | "comfortable" | "expanded";
export type TranscriptFontSize = "small" | "medium" | "large" | "xl";
export type RetentionPolicy = "30d" | "90d" | "180d" | "1y" | "forever";
export type NamingFormat = "name_date" | "project_date" | "custom";
export type SummaryDetail = "concise" | "standard" | "detailed" | "executive";
export type AudioQuality = "low" | "medium" | "high" | "very_high";
export type ExportFormat = "pdf" | "markdown" | "docx" | "html";
export type ExportTemplate = "executive" | "technical" | "management" | "custom";
export type IntegrationKey =
  | "google_calendar"
  | "google_meet"
  | "zoom"
  | "ms_teams"
  | "slack"
  | "notion"
  | "jira"
  | "github";

export interface ProfileSettings {
  fullName: string;
  email: string;
  role: string;
  team: string;
  organization: string;
  timezone: string;
  meetingLanguage: string;
  transcriptLanguage: string;
  avatarUrl?: string | null;
}

export interface WorkspaceSettings {
  workspaceName: string;
  workspaceId: string;
  defaultFolder: string;
  defaultUploadLocation: string;
  retentionPolicy: RetentionPolicy;
  namingFormat: NamingFormat;
  customNamingPattern?: string;
  autoOrganize: boolean;
  autoTag: boolean;
  autoArchive: boolean;
}

export interface AISummarySettings {
  detailLevel: SummaryDetail;
  generateExecutiveBrief: boolean;
  generateDiscussionPoints: boolean;
  generateOpenQuestions: boolean;
  generateNextSteps: boolean;
  generateKeyDecisions: boolean;
}

export interface AIActionItemSettings {
  autoExtract: boolean;
  autoAssignOwners: boolean;
  detectDeadlines: boolean;
  detectPriority: boolean;
  confidenceThreshold: number; // 0-100
}

export interface AITopicSettings {
  topicClustering: boolean;
  trendDetection: boolean;
  recurringTopicAnalysis: boolean;
  similarityDetection: boolean;
}

export interface AIIntelligenceSettings {
  summary: AISummarySettings;
  actionItems: AIActionItemSettings;
  topics: AITopicSettings;
}

export interface AudioProcessingSettings {
  qualityThreshold: AudioQuality;
  diarization: boolean;
  speakerIdentification: boolean;
  noiseReduction: boolean;
  fillerWordRemoval: boolean;
  languageAutoDetect: boolean;
  maxUploadSizeMb: number; // read-only plan limit
  supportedFormats: string[]; // read-only
}

export interface NotificationChannels {
  email: boolean;
  push: boolean;
  inApp: boolean;
}

export interface NotificationTriggers {
  processingComplete: boolean;
  actionItemsGenerated: boolean;
  transcriptReady: boolean;
  summaryReady: boolean;
  weeklyAnalytics: boolean;
  storageNearLimit: boolean;
  integrationFailures: boolean;
  dailyDigest: boolean;
  weeklyDigest: boolean;
}

export interface NotificationSettings {
  channels: NotificationChannels;
  triggers: NotificationTriggers;
}

export interface IntegrationState {
  connected: boolean;
  connectedAt?: string;
  accountLabel?: string;
  options: Record<string, boolean>;
}

export type IntegrationsSettings = Record<IntegrationKey, IntegrationState>;

export interface ExportSettings {
  defaultFormat: ExportFormat;
  include: {
    transcript: boolean;
    summary: boolean;
    actionItems: boolean;
    analytics: boolean;
    speakerBreakdown: boolean;
    aiInsights: boolean;
  };
  template: ExportTemplate;
  autoExportAfterProcessing: boolean;
}

export interface PrivacySettings {
  storeAudioFiles: boolean;
  storeTranscripts: boolean;
  storeSummaries: boolean;
  storeAnalytics: boolean;
  searchIndexing: boolean;
  semanticSearch: boolean;
  allowTeamAccess: boolean;
}

export interface StorageBreakdown {
  audio: number;
  transcripts: number;
  analytics: number;
  reports: number;
  vector: number;
}

export interface StorageInfo {
  usageBytes: number;
  limitBytes: number;
  breakdownBytes: StorageBreakdown;
  plan: string;
}

export interface AppearanceSettings {
  theme: Theme;
  accent: AccentColor;
  density: Density;
  transcriptFontSize: TranscriptFontSize;
  reduceMotion: boolean;
  highContrast: boolean;
}

export interface AdvancedInfo {
  apiEndpoint: string;
  environment: string;
  version: string;
  build: string;
  health: "healthy" | "degraded" | "down";
}

export interface Settings {
  profile: ProfileSettings;
  workspace: WorkspaceSettings;
  ai: AIIntelligenceSettings;
  audio: AudioProcessingSettings;
  notifications: NotificationSettings;
  integrations: IntegrationsSettings;
  exportPrefs: ExportSettings;
  privacy: PrivacySettings;
  storage: StorageInfo;
  appearance: AppearanceSettings;
  advanced: AdvancedInfo;
}

export type SettingsSectionKey =
  | "profile"
  | "workspace"
  | "ai"
  | "audio"
  | "notifications"
  | "integrations"
  | "exportPrefs"
  | "privacy"
  | "storage"
  | "appearance"
  | "advanced";
