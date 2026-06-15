import { PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { TranscriptSegment } from "@/types";
import { SpeakerBadge } from "./SpeakerBadge";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

interface TranscriptMessageProps {
  segment: TranscriptSegment;
  isActive?: boolean;
  query?: string;
  onJump: (ms: number) => void;
  onRenameSpeaker: (raw: string, name: string) => void;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return text;
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "ig");
  return text.split(re).map((chunk, i) =>
    re.test(chunk) ? (
      <mark key={i} className="bg-primary/25 text-primary px-0.5 rounded">
        {chunk}
      </mark>
    ) : (
      <span key={i}>{chunk}</span>
    ),
  );
}

export function TranscriptMessage({
  segment,
  isActive,
  query = "",
  onJump,
  onRenameSpeaker,
}: TranscriptMessageProps) {
  const speakerLabel = segment.speakerName || segment.speaker;

  return (
    <motion.div
      layout
      className={cn(
        "group relative flex gap-md rounded-lg px-sm py-2 transition-all",
        isActive && "transcript-highlight border-l-primary",
      )}
    >
      <button
        onClick={() => onJump(segment.startMs)}
        className={cn(
          "shrink-0 w-14 text-right font-mono text-label-md tracking-wider transition-colors",
          isActive
            ? "text-primary font-bold"
            : "text-outline hover:text-primary",
        )}
      >
        [{formatDuration(segment.startMs)}]
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-sm mb-xs">
          <SpeakerBadge
            name={speakerLabel}
            onClick={() => {
              const next = window.prompt("Rename speaker", speakerLabel);
              if (next && next !== speakerLabel) onRenameSpeaker(segment.speaker, next);
            }}
          />
          <button
            onClick={() => onJump(segment.startMs)}
            className={cn(
              "transition-opacity",
              isActive
                ? "opacity-100 text-primary"
                : "opacity-0 group-hover:opacity-100 text-outline hover:text-primary",
            )}
            aria-label="Play from here"
          >
            <PlayCircle className="w-3.5 h-3.5" />
          </button>
        </div>
        <p
          className={cn(
            "font-geist text-body-md leading-relaxed transition-colors",
            isActive ? "text-on-surface" : "text-on-surface-variant group-hover:text-on-surface",
          )}
        >
          {highlight(segment.text, query)}
        </p>
      </div>
    </motion.div>
  );
}
