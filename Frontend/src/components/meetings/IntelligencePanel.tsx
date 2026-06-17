import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  HelpCircle,
  ListChecks,
  MessageSquare,
  Quote,
} from "lucide-react";
import { useMeetingUIStore } from "@/store/meeting.store";
import { ActionItemCard } from "./ActionItemCard";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";
import type { ActionItem, MeetingDetail } from "@/types";

const TABS: { id: "summary" | "actions" | "analytics"; label: string }[] = [
  { id: "summary", label: "Summary" },
  { id: "actions", label: "Action Items" },
  { id: "analytics", label: "Analytics" },
];

interface IntelligencePanelProps {
  detail: MeetingDetail;
  onToggleActionItem: (id: string, completed: boolean) => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest mb-md pl-2 border-l-2 border-primary">
      {children}
    </h3>
  );
}

function SummarySection({ detail }: { detail: MeetingDetail }) {
  const summary = detail.summary;
  if (!summary) {
    return (
      <p className="font-geist text-body-md text-on-surface-variant">
        Summary is still being distilled. Check back shortly.
      </p>
    );
  }
  return (
    <div className="space-y-xl">
      <section>
        <SectionTitle>Key Decisions</SectionTitle>
        <ul className="space-y-sm">
          {summary.keyDecisions.map((d, i) => (
            <li key={i} className="flex items-start gap-sm font-geist text-body-md text-on-surface">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <SectionTitle>Discussion Points</SectionTitle>
        <div className="p-md rounded-lg border border-outline-variant bg-surface-container font-geist text-body-md text-on-surface-variant space-y-2">
          {summary.discussionPoints.map((p, i) => (
            <p key={i} className="flex gap-sm">
              <MessageSquare className="w-3.5 h-3.5 text-on-surface-variant/70 mt-1 shrink-0" />
              <span>{p}</span>
            </p>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>Open Questions</SectionTitle>
        <ol className="space-y-sm list-decimal list-inside font-geist text-body-md text-on-surface marker:text-on-surface-variant marker:font-mono">
          {summary.openQuestions.map((q, i) => (
            <li key={i} className="leading-relaxed">
              <span className="inline-flex items-baseline gap-xs">
                <HelpCircle className="w-3.5 h-3.5 text-primary -mb-0.5" />
                {q}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionTitle>Next Steps</SectionTitle>
        <ul className="space-y-sm">
          {summary.nextSteps.map((s, i) => (
            <li key={i} className="flex items-start gap-sm font-geist text-body-md text-on-surface">
              <ListChecks className="w-4 h-4 text-tertiary mt-0.5 shrink-0" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ActionItemsSection({
  items,
  onToggle,
}: {
  items: ActionItem[];
  onToggle: (id: string, completed: boolean) => void;
}) {
  if (items.length === 0) {
    return (
      <p className="font-geist text-body-md text-on-surface-variant">
        No action items extracted yet.
      </p>
    );
  }
  const open = items.filter((i) => !i.completed);
  const done = items.filter((i) => i.completed);
  return (
    <div className="space-y-md">
      <div className="flex items-center justify-between">
        <span className="font-mono text-label-md text-on-surface-variant uppercase tracking-wider">
          {open.length} open · {done.length} done
        </span>
        <Badge variant="primary">{items.length} total</Badge>
      </div>
      <div className="space-y-sm">
        {items.map((item) => (
          <ActionItemCard key={item.id} item={item} onToggle={onToggle} />
        ))}
      </div>
    </div>
  );
}

const SPEAKER_COLORS = ["bg-primary", "bg-tertiary", "bg-secondary", "bg-error"];

function AnalyticsSection({ detail }: { detail: MeetingDetail }) {
  const totalMs = detail.speakingTime.reduce((acc, s) => acc + s.ms, 0);
  const maxKw = Math.max(1, ...detail.keywordFrequency.map((k) => k.count));

  return (
    <div className="space-y-xl">
      <section>
        <SectionTitle>Speaking Time</SectionTitle>
        <div className="flex flex-col items-center gap-lg">
          <div className="relative w-44 h-44">
            <svg viewBox="0 0 36 36" className="-rotate-90 w-full h-full">
              {(() => {
                let offset = 0;
                return detail.speakingTime.map((s, i) => {
                  const dash = s.percent;
                  const circle = (
                    <circle
                      key={s.speaker}
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      strokeWidth="3.4"
                      strokeDasharray={`${dash} ${100 - dash}`}
                      strokeDashoffset={-offset}
                      className={cn(
                        i === 0 && "stroke-primary",
                        i === 1 && "stroke-tertiary",
                        i === 2 && "stroke-secondary",
                        i === 3 && "stroke-error",
                      )}
                    />
                  );
                  offset += dash;
                  return circle;
                });
              })()}
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#464554"
                strokeWidth="3.4"
                strokeOpacity="0.25"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-geist font-semibold text-headline-md text-on-surface">
                {formatDuration(totalMs)}
              </p>
              <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
                Total
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-md w-full">
            {detail.speakingTime.map((s, i) => (
              <div key={s.speaker} className="flex items-center gap-sm">
                <span className={cn("w-2.5 h-2.5 rounded-full", SPEAKER_COLORS[i % SPEAKER_COLORS.length])} />
                <div>
                  <p className="font-mono text-label-md text-on-surface uppercase tracking-wider">
                    {s.speaker}
                  </p>
                  <p className="font-geist text-body-md text-on-surface-variant">
                    {formatDuration(s.ms)} ({s.percent.toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionTitle>Keyword Frequency</SectionTitle>
        <div className="space-y-2">
          {detail.keywordFrequency.map((k) => (
            <div key={k.keyword} className="flex items-center gap-sm">
              <span className="font-mono text-label-md text-on-surface-variant uppercase tracking-wider w-32 truncate">
                {k.keyword}
              </span>
              <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded-full"
                  style={{ width: `${(k.count / maxKw) * 100}%` }}
                />
              </div>
              <span className="font-mono text-label-sm text-on-surface-variant w-8 text-right">
                {k.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle>AI Insight</SectionTitle>
        <div className="p-md rounded-lg border border-outline-variant bg-surface-container-highest flex gap-sm">
          <Quote className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <p className="font-geist text-body-md text-on-surface-variant italic">
            Conversation density peaked in the second quarter of the meeting, coinciding
            with the technical architecture discussion.
          </p>
        </div>
      </section>
    </div>
  );
}

export function IntelligencePanel({ detail, onToggleActionItem }: IntelligencePanelProps) {
  const { activeIntelligenceTab, setActiveIntelligenceTab } = useMeetingUIStore();

  return (
    <aside className="flex flex-col h-full bg-surface-container-low border-l border-outline-variant">
      <div className="flex border-b border-outline-variant">
        {TABS.map((tab) => {
          const isActive = activeIntelligenceTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveIntelligenceTab(tab.id)}
              className={cn(
                "flex-1 py-3 font-mono text-label-md uppercase tracking-wider transition-colors relative",
                isActive
                  ? "text-primary bg-surface-container-lowest"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {tab.label}
              {isActive && (
                <motion.span
                  layoutId="intel-tab-active"
                  className="absolute left-0 right-0 bottom-0 h-[2px] bg-primary"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-lg">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIntelligenceTab}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {activeIntelligenceTab === "summary" && <SummarySection detail={detail} />}
            {activeIntelligenceTab === "actions" && (
              <ActionItemsSection items={detail.actionItems} onToggle={onToggleActionItem} />
            )}
            {activeIntelligenceTab === "analytics" && <AnalyticsSection detail={detail} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </aside>
  );
}
