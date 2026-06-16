import { MeetingCard } from "@/components/meetings/MeetingCard";
import type { SearchResult } from "@/types";

interface ResultCardProps {
  result: SearchResult;
  view: "grid" | "list";
}

export function ResultCard({ result, view }: ResultCardProps) {
  return (
    <MeetingCard
      meeting={result.meeting}
      view={view}
      highlight={{
        snippet: result.snippet,
        matchConfidence: result.matchConfidence,
        matchedSpeaker: result.matchedSpeaker,
        matchedTimestamp: result.matchedTimestamp,
      }}
    />
  );
}
