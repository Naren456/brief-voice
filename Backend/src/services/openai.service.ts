// Backend/src/services/openai.service.ts

import "dotenv/config";
import OpenAI from "openai";
import { z } from "zod";

let openrouter: OpenAI | null = null;

function getOpenRouterClient() {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }

  openrouter ??= new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultHeaders: {
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:8000",
      "X-Title": process.env.OPENROUTER_APP_NAME ?? "BriefVoice Platform",
    },
  });

  return openrouter;
}

// Since we are using OpenRouter, you can use any model available on their gateway!
// Examples: "openai/gpt-4o-mini", "anthropic/claude-3-5-sonnet", or "google/gemini-2.5-flash"
const modelName = "openai/gpt-4o-mini";

// --- 1. SCHEMAS FOR OPENROUTER STRUCTURED JSON OUTPUTS ---
// We keep strict: true and define explicit schemas so OpenRouter's supported endpoints
// force 100% deterministic JSON execution records that map cleanly to our Prisma DB.

const summaryJsonSchema = {
  name: "meeting_summary",
  strict: true,
  schema: {
    type: "object",
    properties: {
      attendees: {
        type: "array",
        description: "List of people present or identified by name in the meeting.",
        items: { type: "string" },
      },
      keyDecisions: {
        type: "array",
        description: "Critical decisions, architectural sign-offs, or strategic conclusions reached.",
        items: { type: "string" },
      },
      discussionPoints: {
        type: "array",
        description: "Main topics, technical obstacles, debates, or core themes discussed.",
        items: { type: "string" },
      },
      openQuestions: {
        type: "array",
        description: "Unresolved issues, blockers, or questions raised that need later answers.",
        items: { type: "string" },
      },
      nextSteps: {
        type: "array",
        description: "General future roadmap action tracks or directions discussed.",
        items: { type: "string" },
      },
      insights: {
        type: "string",
        description: "A single, compelling, and unique analytical insight drawn from the conversation dynamics or content.",
      },
    },
    required: ["attendees", "keyDecisions", "discussionPoints", "openQuestions", "nextSteps", "insights"],
    additionalProperties: false,
  },
};

const actionItemsJsonSchema = {
  name: "action_items_list",
  strict: true,
  schema: {
    type: "object",
    properties: {
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            task: { type: "string", description: "The specific action item or commitment." },
            owner: { type: "string", description: "The name or speaker label (e.g. 'Speaker A') responsible for the item." },
            deadline: { type: "string", description: "The explicit deadline, if stated." },
          },
          required: ["task", "owner", "deadline"],
          additionalProperties: false,
        },
      },
    },
    required: ["items"],
    additionalProperties: false,
  },
};

const analyticsJsonSchema = {
  name: "analytics_insights",
  strict: true,
  schema: {
    type: "object",
    properties: {
      keywords: {
        type: "array",
        description: "Top 4 most frequently discussed business keywords across all meetings.",
        items: { type: "string" },
      },
      trendingTopics: {
        type: "array",
        description: "Top 3 overarching themes or topics with their current trajectory.",
        items: {
          type: "object",
          properties: {
            topic: { type: "string" },
            state: { type: "string", enum: ["trending", "stable", "emerging"] },
          },
          required: ["topic", "state"],
          additionalProperties: false,
        },
      },
    },
    required: ["keywords", "trendingTopics"],
    additionalProperties: false,
  },
};

// --- 2. EXPORT INTERFACES ---

export interface OpenAISummaryOutput {
  attendees: string[];
  keyDecisions: string[];
  discussionPoints: string[];
  openQuestions: string[];
  nextSteps: string[];
  insights: string;
}

export interface OpenAIActionItemOutput {
  task: string;
  owner: string | null;
  deadline: string | null;
}

// --- 3. ZOD RUNTIME GUARDRAILS ---
// These ensure the LLM output is structurally sound and type-safe at runtime.

const ZodSummarySchema = z.object({
  attendees: z.array(z.string()),
  keyDecisions: z.array(z.string()),
  discussionPoints: z.array(z.string()),
  openQuestions: z.array(z.string()),
  nextSteps: z.array(z.string()),
  insights: z.string(),
});

const ZodActionItemSchema = z.object({
  task: z.string(),
  owner: z.string(),
  deadline: z.string(),
});

const ZodActionItemsResponseSchema = z.object({
  items: z.array(ZodActionItemSchema),
});

const ZodAnalyticsSchema = z.object({
  keywords: z.array(z.string()),
  trendingTopics: z.array(
    z.object({
      topic: z.string(),
      state: z.enum(["trending", "stable", "emerging"]),
    })
  ),
});

/**
 * Parses a conversation transcript using OpenRouter to generate a structured summary.
 */
export async function generateSummary(transcriptText: string, identifiedSpeakers: string[]): Promise<OpenAISummaryOutput> {
  try {
    console.log(`[OpenRouter Service] Generating summary using model: ${modelName}`);
    const response = await getOpenRouterClient().chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical meeting intelligence analyst. The transcript is speaker-labelled (e.g. 'Speaker A: ...'). " +
            "Synthesize it into a clean, accurate summary matching the schema exactly. " +
            "Populate every section; if a section genuinely has no content, return an empty array rather than inventing items. " +
            "Attribute attendees and decisions to the named/labelled speakers shown in the transcript.",
        },
        {
          role: "user",
          content: `Identified Speaker Labels:\n${identifiedSpeakers.join(", ")}\n\nTranscript:\n"""\n${transcriptText}\n"""`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: summaryJsonSchema,
      },
      max_tokens: 900,
      temperature: 0.1, 
    });

    const content = response.choices[0]?.message?.content;
    const usage = response.usage;
    console.log(`[OpenRouter Service] Summary generation complete. Tokens used: Prompt ${usage?.prompt_tokens}, Completion ${usage?.completion_tokens}, Total ${usage?.total_tokens}`);
    
    if (!content) throw new Error("Received empty response from OpenRouter gateway.");
    
    // GUARDRAIL: Validate the JSON structure at runtime using Zod
    console.log(`[OpenRouter Service] Parsing and validating summary JSON structure...`);
    const rawData = JSON.parse(content);
    const validatedData = ZodSummarySchema.parse(rawData);
    
    return validatedData as OpenAISummaryOutput;
  } catch (error) {
    console.error("[OpenRouter Service] Error generating summary:", error);
    return {
      attendees: [],
      keyDecisions: ["Failed to synthesize summary due to an execution proxy error."],
      discussionPoints: [],
      openQuestions: [],
      nextSteps: [],
      insights: "Insights could not be generated due to an error.",
    };
  }
}

/**
 * Extracts discrete action items, parsing out owners and deadlines via OpenRouter gateway models.
 */
export async function extractActionItems(transcriptText: string): Promise<OpenAIActionItemOutput[]> {
  try {
    console.log(`[OpenRouter Service] Extracting action items using model: ${modelName}`);
    const response = await getOpenRouterClient().chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
            "Extract all explicit action items, commitments, and follow-ups made by participants in the transcript. " +
            "The transcript is speaker-labelled (e.g. 'Speaker A: ...'); set 'owner' to the speaker who committed to or was assigned the task. " +
            "Only capture explicitly stated tasks — do not invent items. Use an empty string for owner or deadline when not stated.",
        },
        {
          role: "user",
          content: `Transcript:\n"""\n${transcriptText}\n"""`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: actionItemsJsonSchema,
      },
      max_tokens: 700,
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    const usage = response.usage;
    console.log(`[OpenRouter Service] Action item extraction complete. Tokens used: Prompt ${usage?.prompt_tokens}, Completion ${usage?.completion_tokens}, Total ${usage?.total_tokens}`);

    if (!content) throw new Error("Received empty response from OpenRouter gateway.");

    // GUARDRAIL: Validate the JSON structure at runtime using Zod
    console.log(`[OpenRouter Service] Parsing and validating action items JSON structure...`);
    const rawData = JSON.parse(content);
    const validatedData = ZodActionItemsResponseSchema.parse(rawData);
    
    // Normalize empty strings back to null values to match our relational Prisma schema layout
    return validatedData.items.map((item) => ({
      task: item.task,
      owner: item.owner.trim() === "" ? null : item.owner,
      deadline: item.deadline.trim() === "" ? null : item.deadline,
    }));
  } catch (error) {
    console.error("[OpenRouter Service] Error extracting action items:", error);
    return [];
  }
}

/**
 * Extracts global analytics insights from a combined context of recent meeting summaries.
 */
export async function generateAnalyticsInsights(meetingsContext: string) {
  try {
    console.log(`[OpenRouter Service] Extracting analytics insights using model: ${modelName}`);
    const response = await getOpenRouterClient().chat.completions.create({
      model: modelName,
      messages: [
        {
          role: "system",
          content:
            "You are an expert technical meeting analyst. You will be provided with a combined text of recent meeting summaries and discussion points. " +
            "Your job is to identify the top 4 recurring business keywords (e.g., 'architecture', 'budget', 'roadmap') and the top 3 high-level trending topics " +
            "across these meetings. Assign a state ('trending', 'stable', or 'emerging') to each topic based on the context provided.",
        },
        {
          role: "user",
          content: `Recent Meeting Context:\n"""\n${meetingsContext}\n"""`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: analyticsJsonSchema,
      },
      max_tokens: 400,
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content;
    const usage = response.usage;
    console.log(`[OpenRouter Service] Analytics extraction complete. Tokens used: Prompt ${usage?.prompt_tokens}, Completion ${usage?.completion_tokens}, Total ${usage?.total_tokens}`);

    if (!content) throw new Error("Received empty response from OpenRouter gateway.");

    console.log(`[OpenRouter Service] Parsing and validating analytics JSON structure...`);
    const rawData = JSON.parse(content);
    return ZodAnalyticsSchema.parse(rawData);
  } catch (error) {
    console.error("[OpenRouter Service] Error extracting analytics:", error);
    return {
      keywords: ["meetings", "action items", "decisions", "blockers"],
      trendingTopics: [
        { topic: "upload", state: "emerging" as const },
        { topic: "planning", state: "stable" as const },
        { topic: "review", state: "trending" as const }
      ]
    };
  }
}
