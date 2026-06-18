import { MoreVertical } from "lucide-react";
import type { ActionItem } from "@/types";
import { SpeakerBadge } from "./SpeakerBadge";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/cn";
import { formatDate } from "@/lib/format";

interface ActionItemCardProps {
  item: ActionItem;
  onToggle: (id: string, completed: boolean) => void;
}

function deadlineVariant(deadline?: string | null): {
  variant: "warning" | "neutral" | "success";
  label: string;
} {
  if (!deadline) return { variant: "neutral", label: "No deadline" };
  const due = new Date(deadline).getTime();
  // Deadlines are free-form LLM-extracted strings (e.g. "next sprint"), which
  // may not parse into a real date. Show them as-is instead of crashing.
  if (Number.isNaN(due)) return { variant: "neutral", label: deadline };
  const now = Date.now();
  const days = Math.round((due - now) / 86400000);
  if (days < 0) return { variant: "warning", label: `Overdue • ${formatDate(deadline)}` };
  if (days <= 3) return { variant: "warning", label: `Due ${formatDate(deadline)}` };
  if (days <= 14) return { variant: "neutral", label: `Due ${formatDate(deadline)}` };
  return { variant: "success", label: `Due ${formatDate(deadline)}` };
}

export function ActionItemCard({ item, onToggle }: ActionItemCardProps) {
  const due = deadlineVariant(item.deadline);
  return (
    <div
      className={cn(
        "p-md bg-surface-container border border-outline-variant rounded-lg flex items-start justify-between group transition-all",
        item.completed && "opacity-60",
      )}
    >
      <div className="flex items-start gap-md min-w-0 flex-1">
        <input
          type="checkbox"
          checked={item.completed}
          onChange={(e) => onToggle(item.id, e.target.checked)}
          className="mt-1 w-4 h-4 rounded border border-outline-variant bg-surface-container-highest text-primary focus:ring-0 cursor-pointer accent-primary"
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "font-geist text-body-md text-on-surface mb-2 leading-snug",
              item.completed && "line-through",
            )}
          >
            {item.task}
          </p>
          <div className="flex flex-wrap items-center gap-xs">
            <SpeakerBadge name={item.owner} size="sm" />
            <Badge variant={due.variant === "success" ? "success" : due.variant}>
              {due.label}
            </Badge>
            {item.priority && (
              <Badge
                variant={item.priority === "high" ? "warning" : "outline"}
                className="uppercase"
              >
                {item.priority}
              </Badge>
            )}
          </div>
        </div>
      </div>
      <button
        className="text-outline opacity-0 group-hover:opacity-100 hover:text-on-surface transition-opacity ml-md"
        aria-label="More"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  );
}
