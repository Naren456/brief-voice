import "dotenv/config";
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL ?? "http://localhost:6333";
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;
export const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION ?? "briefvoice_meetings";
export const VECTOR_SIZE = 384; // all-MiniLM-L6-v2 output dimension

export const qdrant = new QdrantClient({ 
  url: QDRANT_URL,
  ...(QDRANT_API_KEY ? { apiKey: QDRANT_API_KEY } : {})
});

/**
 * Ensures the Qdrant collection exists with the correct vector config.
 * Called lazily before the first write or search — safe to call multiple times.
 */
export async function ensureCollection(): Promise<void> {
  const { collections } = await qdrant.getCollections();
  const exists = collections.some((c) => c.name === QDRANT_COLLECTION);

  if (!exists) {
    await qdrant.createCollection(QDRANT_COLLECTION, {
      vectors: {
        size: VECTOR_SIZE,
        distance: "Cosine",
      },
    });
    console.log(`[Database] Created Qdrant collection: "${QDRANT_COLLECTION}"`);
  }
}
