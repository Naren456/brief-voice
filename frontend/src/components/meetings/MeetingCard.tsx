import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  MoreVertical,
  Pin,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/format";
import type { Meeting } from "@/types";
import { cn } from "@/lib/cn";

interface MeetingCardProps {
  meeting: Meeting;
  highlight?: { snippet: string; matchConfidence: number; matchedSpeaker?: string; matchedTimestamp?: number };
  view?: "grid" | "list";
}

export function MeetingCard({ meeting, highlight, view = "grid" }: MeetingCardProps) {
  const isExpanded = !!highlight;
  const isList = view === "list";

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group bg-surface-container rounded-xl overflow-hidden flex flex-col border transition-colors",
        isExpanded
          ? "border-primary/30 shadow-glow-primary"
          : "border-outline-variant hover:border-outline",
        isList && "flex-row items-stretch",
      )}
    >
      <Link to={`/meeting/${meeting.id}`} className="contents">
        <div className={cn("p-lg space-y-md", isList && "flex-1")}>
          <div className="flex items-start justify-between gap-md">
            <Badge variant={isExpanded ? "primary" : "neutral"} className="uppercase">
              {meeting.category ?? "Meeting"}
            </Badge>
            {meeting.pinned ? (
              <Pin className="w-4 h-4 text-outline-variant fill-outline-variant" />
            ) : (
              <MoreVertical className="w-4 h-4 text-outline" />
            )}
          </div>

          <h4 className="font-geist font-semibold text-on-surface text-[18px] leading-tight group-hover:text-primary transition-colors">
            {meeting.title}
          </h4>

          <div className="flex items-center gap-lg font-mono text-label-md text-on-surface-variant uppercase tracking-wider">
            <span className="flex items-center gap-xs">
              <CalendarDays className="w-3.5 h-3.5" />
              {formatDate(meeting.createdAt)}
            </span>
            <span className="flex items-center gap-xs">
              <Users className="w-3.5 h-3.5" />
              {meeting.speakerCount} Speakers
            </span>
            {meeting.actionItemCount > 0 && (
              <span className="flex items-center gap-xs text-tertiary">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {meeting.actionItemCount} Tasks
              </span>
            )}
          </div>
        </div>

        {isExpanded && highlight && (
          <div className="px-lg pb-lg pt-md border-t border-outline-variant bg-surface-container-low relative">
            <div className="absolute top-md right-md">
              <span className="font-mono text-label-sm text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded uppercase tracking-wider">
                Matches query ({Math.round(highlight.matchConfidence * 100)}%)
              </span>
            </div>
            <p className="font-geist text-body-md text-on-surface-variant leading-relaxed pr-32">
              {highlight.snippet}
            </p>
            <div className="mt-md flex items-center justify-between">
              <div className="flex items-center gap-sm">
                {highlight.matchedSpeaker && (
                  <span className="font-geist text-label-md text-on-surface">
                    {highlight.matchedSpeaker}
                  </span>
                )}
                {highlight.matchedTimestamp != null && (
                  <span className="font-mono text-label-sm text-on-surface-variant">
                    {Math.floor(highlight.matchedTimestamp / 60_000)}:
                    {String(
                      Math.floor((highlight.matchedTimestamp % 60_000) / 1000),
                    ).padStart(2, "0")}
                  </span>
                )}
              </div>
              <span className="inline-flex items-center gap-xs text-primary font-mono text-label-md uppercase tracking-wider">
                Open transcript
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        )}

        {!isExpanded && meeting.summarySnippet && (
          <div className="mt-auto px-lg py-md border-t border-outline-variant bg-surface-container-low opacity-80">
            <p className="font-geist text-body-md text-on-surface-variant truncate">
              {meeting.summarySnippet}
            </p>
          </div>
        )}
      </Link>
    </motion.article>
  );
}
