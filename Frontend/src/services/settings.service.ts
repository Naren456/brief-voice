import { api } from "./api";
import type { Settings } from "@/types/settings";

const GB = 1024 ** 3;

export const DEFAULT_SETTINGS: Settings = {
  profile: {
    fullName: "Yatharth Verma",
    email: "yatharth@briefvoice.ai",
    role: "Founding Engineer",
    team: "Platform",
    organization: "BriefVoice",
    timezone: "Asia/Kolkata",
    meetingLanguage: "English",
    transcriptLanguage: "English",
    avatarUrl: null,
  },
  workspace: {
    workspaceName: "BriefVoice HQ",
    workspaceId: "ws_3f8c41ad7e2b",
    defaultFolder: "Default Folder",
    defaultUploadLocation: "/uploads",
    retentionPolicy: "1y",
    namingFormat: "name_date",
    customNamingPattern: "{project}_{date:YYYY-MM-DD}",
    autoOrganize: true,
    autoTag: true,
    autoArchive: false,
  },
  ai: {
    summary: {
      detailLevel: "standard",
      generateExecutiveBrief: true,
      generateDiscussionPoints: true,
      generateOpenQuestions: true,
      generateNextSteps: true,
      generateKeyDecisions: true,
    },
    actionItems: {
      autoExtract: true,
      autoAssignOwners: true,
      detectDeadlines: true,
      detectPriority: true,
      confidenceThreshold: 72,
    },
    topics: {
      topicClustering: true,
      trendDetection: true,
      recurringTopicAnalysis: true,
      similarityDetection: false,
    },
  },
  audio: {
    qualityThreshold: "high",
    diarization: true,
    speakerIdentification: true,
    noiseReduction: true,
    fillerWordRemoval: false,
    languageAutoDetect: true,
    maxUploadSizeMb: 50,
    supportedFormats: ["MP3", "WAV", "M4A"],
  },
  notifications: {
    channels: {
      email: true,
      push: false,
      inApp: true,
    },
    triggers: {
      processingComplete: true,
      actionItemsGenerated: true,
      transcriptReady: true,
      summaryReady: true,
      weeklyAnalytics: true,
      storageNearLimit: true,
      integrationFailures: true,
      dailyDigest: false,
      weeklyDigest: true,
    },
  },
  integrations: {
    google_calendar: { connected: true, accountLabel: "yatharth@briefvoice.ai", options: { syncEvents: true } },
    google_meet: { connected: true, accountLabel: "yatharth@briefvoice.ai", options: { autoImport: true } },
    zoom: { connected: false, options: { autoImport: false } },
    ms_teams: { connected: false, options: { autoImport: false } },
    slack: {
      connected: true,
      accountLabel: "#briefvoice-ops",
      options: { sendSummaries: true, sendActionItems: true },
    },
    notion: { connected: false, options: { pushSummaries: false } },
    jira: { connected: false, options: { convertActionItems: false } },
    github: { connected: true, accountLabel: "briefvoice/ops", options: { createIssues: false } },
  },
  exportPrefs: {
    defaultFormat: "pdf",
    include: {
      transcript: true,
      summary: true,
      actionItems: true,
      analytics: false,
      speakerBreakdown: false,
      aiInsights: true,
    },
    template: "executive",
    autoExportAfterProcessing: false,
  },
  privacy: {
    storeAudioFiles: true,
    storeTranscripts: true,
    storeSummaries: true,
    storeAnalytics: true,
    searchIndexing: true,
    semanticSearch: true,
    allowTeamAccess: true,
  },
  storage: {
    usageBytes: 38.4 * GB,
    limitBytes: 100 * GB,
    breakdownBytes: {
      audio: 22.1 * GB,
      transcripts: 6.4 * GB,
      analytics: 2.2 * GB,
      reports: 1.7 * GB,
      vector: 6.0 * GB,
    },
    plan: "Team Pro",
  },
  appearance: {
    theme: "dark",
    accent: "indigo",
    density: "comfortable",
    transcriptFontSize: "medium",
    reduceMotion: false,
    highContrast: false,
  },
  advanced: {
    apiEndpoint: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
    environment: import.meta.env.MODE,
    version: "0.1.0",
    build: "briefvoice-2026.06.15+sha.9f3a1c",
    health: "healthy",
  },
};

function delay<T>(value: T, ms = 250): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

// Backend does not currently implement a settings API route, so we use local default state.
export const settingsService = {
  async get(): Promise<Settings> {
    return delay(DEFAULT_SETTINGS);
  },

  async save(settings: Settings): Promise<Settings> {
    return delay(settings, 450);
  },

  async resetSection<K extends keyof Settings>(section: K): Promise<Settings[K]> {
    return delay(DEFAULT_SETTINGS[section]);
  },

  async runDangerousAction(action: string): Promise<{ ok: true; action: string }> {
    if (action === "delete_all_meetings") {
      await api.delete("/meetings/all");
      return { ok: true as const, action };
    }
    // Fallback for other mock dangerous actions
    return delay({ ok: true as const, action }, 600);
  },
};
