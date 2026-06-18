// Backend/src/services/assemblyai.service.ts

import "dotenv/config";
import { AssemblyAI } from "assemblyai";
import path from "path";
import fs from "fs";

let client: AssemblyAI | null = null;

function getAssemblyAIClient() {
  if (!process.env.ASSEMBLYAI_API_KEY) {
    throw new Error("ASSEMBLYAI_API_KEY is not configured.");
  }

  client ??= new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY });
  return client;
}

interface TranscriptSegment {
  speaker: string;
  text: string;
  startMs: number;
  endMs: number;
}

interface TranscriptionResult {
  fullText: string;
  segments: TranscriptSegment[];
}

/**
 * Transcribes a local audio file by uploading it to AssemblyAI.
 * @param localFilePath Path to the file stored on disk (e.g., .mp3, .m4a)
 */
export async function transcribeAudio(localFilePath: string): Promise<TranscriptionResult> {
  try {
    const absolutePath = path.resolve(localFilePath);
    
    if (!fs.existsSync(absolutePath)) {
      throw new Error(`Audio file not found at path: ${absolutePath}`);
    }

    const assembly = getAssemblyAIClient();
    const fileStream = fs.createReadStream(absolutePath);

    console.log(`[AssemblyAI Service] Uploading audio to AssemblyAI...`);
    const uploadUrl = await assembly.files.upload(fileStream);
    console.log(`[AssemblyAI Service] Upload successful (URL: ${uploadUrl}). Starting diarization pipeline...`);

    const transcript = await assembly.transcripts.transcribe({
      audio: uploadUrl,
      speaker_labels: true, // Crucial for parsing separate meeting attendees
    });

    if (transcript.status === "error") {
      console.error(`[AssemblyAI Service] Execution failed: ${transcript.error}`);
      throw new Error(`AssemblyAI execution failed: ${transcript.error}`);
    }

    const fullText = transcript.text || "";
    const utterances = transcript.utterances || [];
    
    console.log(`[AssemblyAI Service] Transcription complete. Extracted ${utterances.length} utterances. Audio duration: ${transcript.audio_duration} seconds.`);

    const segments = utterances.map((u) => ({
      speaker: `Speaker ${u.speaker}`, // Normalizes "A" -> "Speaker A"
      text: u.text,
      startMs: u.start,
      endMs: u.end,
    }));

    return { fullText, segments };
  } catch (error) {
    console.error("Error in assemblyai.service.ts:", error);
    throw error;
  }
}
