import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Search, ScrollText } from "lucide-react";
import { TranscriptMessage } from "@/components/meetings/TranscriptMessage";
import { IntelligencePanel } from "@/components/meetings/IntelligencePanel";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMeeting, useRenameSpeakers, useToggleActionItem } from "@/hooks/useMeetings";
import { usePlayerStore } from "@/store/player.store";
import { useMeetingUIStore } from "@/store/meeting.store";
import { formatDate, formatDuration } from "@/lib/format";
import { Badge } from "@/components/ui/Badge";

export function MeetingDetail() {
  const { id } = useParams();
  const meetingId = id ?? "";
  const { data, isLoading } = useMeeting(meetingId);
  const renameSpeakers = useRenameSpeakers(meetingId);
  const toggleAction = useToggleActionItem(meetingId);

  const { positionMs, seek, play, current } = usePlayerStore();
  const { transcriptQuery, setTranscriptQuery } = useMeetingUIStore();
  const [showSearch, setShowSearch] = useState(false);

  // When a meeting opens, sync the dock to this meeting if it isn't already.
  useEffect(() => {
    if (!data) return;
    if (current?.meetingId !== data.id) {
      play({
        meetingId: data.id,
        title: data.title,
        subtitle: formatDate(data.createdAt),
        durationMs: data.durationMs,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  const activeSegmentId = useMemo(() => {
    if (!data?.transcript) return null;
    const seg = [...data.transcript.segments]
      .reverse()
      .find((s) => positionMs >= s.startMs);
    return seg?.id ?? null;
  }, [data?.transcript, positionMs]);

  const filteredSegments = useMemo(() => {
    if (!data?.transcript) return [];
    const q = transcriptQuery.trim().toLowerCase();
    if (!q) return data.transcript.segments;
    return data.transcript.segments.filter((s) =>
      (s.text + " " + (s.speakerName ?? s.speaker)).toLowerCase().includes(q),
    );
  }, [data?.transcript, transcriptQuery]);

  if (isLoading) {
    return (
      <div className="p-lg grid grid-cols-1 lg:grid-cols-[1fr_460px] gap-lg h-full">
        <Skeleton className="h-full" />
        <Skeleton className="h-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-2xl">
        <EmptyState
          icon={ScrollText}
          title="Meeting not found"
          description="The meeting may have been removed or hasn't been indexed yet."
        />
      </div>
    );
  }

  // Show a beautifully animated loading state while the meeting is being distilled
  if (data.status !== "ready" && data.status !== "processed") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-2xl">
        <div className="relative w-24 h-24 mb-lg">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <div className="relative w-full h-full rounded-2xl bg-surface-container border border-outline-variant flex items-center justify-center shadow-lg animate-pulse">
            <ScrollText className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="font-geist font-semibold text-headline-sm text-on-surface mb-2">
          Distilling Intelligence
        </h1>
        <p className="font-geist text-body-md text-on-surface-variant max-w-md text-center leading-relaxed">
          Our AI models are actively transcribing, diarizing, and extracting action items from your audio.
        </p>
        <div className="mt-8 flex flex-col gap-3 w-64 bg-surface-container-low p-4 rounded-xl border border-outline-variant/50">
           <div className="flex justify-between font-mono text-label-sm uppercase text-on-surface-variant tracking-wider">
             <span>Pipeline Status</span>
             <span className="text-primary font-medium animate-pulse">
               {data.status === "uploaded" ? "waiting" : data.status}
             </span>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Meeting header strip */}
      <div className="px-lg py-md border-b border-outline-variant bg-surface flex items-center justify-between gap-md">
        <div className="flex items-center gap-md min-w-0">
          <div>
            <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
              {data.category ?? "Meeting"}
            </p>
            <h1 className="font-geist font-semibold text-headline-md text-on-surface truncate">
              {data.title}
            </h1>
          </div>
          <div className="h-8 w-px bg-outline-variant mx-sm" />
          <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-wider">
            {formatDate(data.createdAt)} • {formatDuration(data.durationMs)}
          </p>
        </div>
        <div className="flex items-center gap-sm">
          <Badge variant="primary">{data.speakerCount} Speakers</Badge>
          <Badge variant="success">{data.actionItems.length} Tasks</Badge>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 flex min-h-0">
        {/* Left/center: transcript */}
        <section className="flex-1 flex flex-col bg-surface min-h-0 border-r border-outline-variant">
          <div className="px-lg py-2 border-b border-outline-variant flex items-center justify-between bg-surface-container-lowest">
            <span className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest">
              Transcript
            </span>
            <div className="flex items-center gap-sm">
              {showSearch ? (
                <div className="flex items-center gap-sm h-8 px-2 rounded-lg border border-outline-variant bg-surface-container-low">
                  <Search className="w-3.5 h-3.5 text-on-surface-variant" />
                  <input
                    autoFocus
                    type="text"
                    value={transcriptQuery}
                    onChange={(e) => setTranscriptQuery(e.target.value)}
                    placeholder="Search transcript…"
                    className="bg-transparent border-none outline-none text-[12px] font-geist text-on-surface placeholder:text-outline w-48"
                  />
                  <button
                    onClick={() => {
                      setShowSearch(false);
                      setTranscriptQuery("");
                    }}
                    className="font-mono text-label-sm text-on-surface-variant hover:text-on-surface uppercase tracking-widest"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSearch(true)}
                  className="text-xs px-2 py-1 border border-outline-variant rounded font-mono text-label-md text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                >
                  Search
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-lg py-lg space-y-md min-h-0">
            {filteredSegments.length === 0 ? (
              <EmptyState
                icon={ScrollText}
                title="No transcript matches"
                description="Try a different query, or clear the search."
              />
            ) : (
              filteredSegments.map((seg) => (
                <TranscriptMessage
                  key={seg.id}
                  segment={seg}
                  isActive={seg.id === activeSegmentId}
                  query={transcriptQuery}
                  onJump={(ms) => seek(ms)}
                  onRenameSpeaker={(raw, name) =>
                    renameSpeakers.mutate({ [raw]: name })
                  }
                />
              ))
            )}
          </div>
        </section>

        {/* Right: intelligence panel */}
        <div className="w-[420px] xl:w-[460px] shrink-0 hidden lg:block min-h-0">
          <IntelligencePanel
            detail={data}
            onToggleActionItem={(itemId, completed) =>
              toggleAction.mutate({ itemId, completed })
            }
          />
        </div>
      </div>
    </div>
  );
}
