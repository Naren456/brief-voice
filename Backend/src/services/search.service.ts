// Backend/src/services/search.service.ts
//
// Semantic search over the meeting archive, backed by Qdrant vector database.
//
// Embeddings are generated locally with @xenova/transformers
// (all-MiniLM-L6-v2, 384-dim, normalized) — no external API key required.
// Vectors are stored in and queried from Qdrant, which handles ANN search
// natively and scales far better than the previous SQLite approach.

import { prisma } from "../db/prisma";
import { qdrant, ensureCollection, QDRANT_COLLECTION } from "../db/qdrant";
import { randomUUID } from "crypto";

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const EMBEDDING_MODEL   = "Xenova/all-MiniLM-L6-v2";

// ─── CLIENTS (lazy-initialised) ──────────────────────────────────────────────

// The transformers pipeline is loaded lazily on first use (model is downloaded
// and cached once) and reused across calls.
let extractorPromise: Promise<any> | null = null;

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import("@xenova/transformers").then(({ pipeline }) =>
      pipeline("feature-extraction", EMBEDDING_MODEL)
    );
  }
  return extractorPromise;
}

// ─── PUBLIC: EMBEDDING GENERATION ────────────────────────────────────────────

/** Embed a single piece of text into a normalized 384-dim vector. */
export async function generateEmbedding(text: string): Promise<number[]> {
  const extractor = await getExtractor();
  const output = await extractor(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

// ─── PUBLIC: INDEX A MEETING ─────────────────────────────────────────────────

interface Chunk {
  chunkType: "transcript" | "summary";
  speaker:   string | null;
  startMs:   number | null;
  text:      string;
}

/**
 * Index a fully-processed meeting: embed each transcript segment plus the
 * summary sections and upsert them into Qdrant.
 *
 * Re-indexing is safe — all existing points for the meeting are deleted first.
 */
export async function indexMeeting(meetingId: string): Promise<void> {
  const transcript = await prisma.transcript.findUnique({
    where:   { meetingId },
    include: { segments: { orderBy: { startMs: "asc" } } },
  });
  const summary = await prisma.meetingSummary.findUnique({ where: { meetingId } });

  const chunks: Chunk[] = [];

  // One chunk per diarized segment (already semantically scoped).
  for (const seg of transcript?.segments ?? []) {
    if (seg.text.trim().length === 0) continue;
    chunks.push({
      chunkType: "transcript",
      speaker:   seg.speakerName || seg.speaker,
      startMs:   seg.startMs,
      text:      seg.text,
    });
  }

  // Index summary sections so queries can match decisions/topics directly.
  if (summary) {
    const summaryParts: Array<[string, string]> = [
      ["Key decisions",    summary.keyDecisions],
      ["Discussion points", summary.discussionPoints],
      ["Open questions",   summary.openQuestions],
      ["Next steps",       summary.nextSteps],
    ];
    for (const [label, json] of summaryParts) {
      let items: string[] = [];
      try {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) items = parsed;
      } catch { /* ignore malformed JSON */ }
      if (items.length > 0) {
        chunks.push({
          chunkType: "summary",
          speaker:   null,
          startMs:   null,
          text:      `${label}: ${items.join("; ")}`,
        });
      }
    }
  }

  await ensureCollection();

  // Delete any prior points for this meeting before upserting fresh ones.
  await deleteMeetingEmbeddings(meetingId);

  if (chunks.length === 0) return;

  // Build Qdrant point objects — one per chunk.
  const points = await Promise.all(
    chunks.map(async (chunk) => {
      const vector = await generateEmbedding(chunk.text);
      return {
        id:      randomUUID(),          // Qdrant accepts UUID strings as point IDs
        vector,
        payload: {
          meetingId:  meetingId,
          chunkType:  chunk.chunkType,
          speaker:    chunk.speaker    ?? null,
          startMs:    chunk.startMs    ?? null,
          text:       chunk.text,
        },
      };
    })
  );

  await qdrant.upsert(QDRANT_COLLECTION, { points, wait: true });
  console.log(`[Search] Indexed ${points.length} chunks for meeting ${meetingId}`);
}

// ─── PUBLIC: DELETE A MEETING FROM THE INDEX ─────────────────────────────────

/** Remove all of a meeting's vectors from Qdrant. */
export async function deleteMeetingEmbeddings(meetingId: string): Promise<void> {
  try {
    await ensureCollection();
    await qdrant.delete(QDRANT_COLLECTION, {
      wait:   true,
      filter: {
        must: [{ key: "meetingId", match: { value: meetingId } }],
      },
    });
  } catch (err) {
    // If the collection doesn't exist yet there is nothing to delete — safe to swallow.
    console.warn(`[Search] deleteMeetingEmbeddings: ${(err as Error).message}`);
  }
}

/** Remove all vectors and the entire collection from Qdrant. */
export async function deleteAllEmbeddings(): Promise<void> {
  try {
    await qdrant.deleteCollection(QDRANT_COLLECTION);
  } catch (err) {
    console.warn(`[Search] deleteAllEmbeddings: ${(err as Error).message}`);
  }
}

// ─── PUBLIC: SEMANTIC SEARCH ─────────────────────────────────────────────────

export interface SearchResult {
  meetingId:     string;
  meetingTitle:  string;
  snippet:       string;
  speaker:       string | null;
  startMs:       number | null;
  chunkType:     string;
  relevanceScore: number;
}

/**
 * Semantic search across all indexed meetings.
 * Embeds the query with the same local model, then queries Qdrant for the
 * top-K nearest neighbours ranked by cosine similarity.
 */
export async function searchMeetings(query: string, limit = 5): Promise<SearchResult[]> {
  await ensureCollection();

  const queryVector = await generateEmbedding(query);

  const response = await qdrant.search(QDRANT_COLLECTION, {
    vector: queryVector,
    limit,
    with_payload: true,
  });

  if (response.length === 0) return [];

  // Fetch meeting filenames for the matched IDs in one query.
  const meetingIds = [...new Set(response.map((r) => r.payload!["meetingId"] as string))];
  const meetings   = await prisma.meeting.findMany({
    where:  { id: { in: meetingIds } },
    select: { id: true, filename: true },
  });
  const titleMap = Object.fromEntries(meetings.map((m) => [m.id, m.filename]));

  return response.map((hit) => {
    const p = hit.payload as Record<string, any>;
    return {
      meetingId:      p["meetingId"],
      meetingTitle:   titleMap[p["meetingId"]] ?? "Unknown",
      snippet:        p["text"],
      speaker:        p["speaker"]  ?? null,
      startMs:        p["startMs"]  ?? null,
      chunkType:      p["chunkType"],
      relevanceScore: hit.score,
    };
  });
}
