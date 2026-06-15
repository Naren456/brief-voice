import { AlertTriangle, MoreVertical, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { AnalyticsOverview } from "@/types";

interface BottlenecksFeedProps {
  items: AnalyticsOverview["bottlenecks"];
}

export function BottlenecksFeed({ items }: BottlenecksFeedProps) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
      <div className="p-lg border-b border-outline-variant bg-surface-container-lowest">
        <h4 className="font-geist font-semibold text-headline-md text-on-surface">
          AI-Identified Operational Bottlenecks
        </h4>
        <p className="font-geist text-body-md text-on-surface-variant">
          Latest patterns surfaced from the intelligence stream.
        </p>
      </div>
      <ul className="divide-y divide-outline-variant">
        {items.map((b) => {
          const isWarning = b.severity === "warning";
          const Icon = isWarning ? AlertTriangle : Sparkles;
          return (
            <li
              key={b.id}
              className="p-lg flex items-start gap-lg hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full border flex items-center justify-center shrink-0",
                  isWarning
                    ? "border-secondary text-secondary"
                    : "border-tertiary text-tertiary",
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-md mb-xs">
                  <h5 className="font-geist font-semibold text-body-lg text-on-surface truncate">
                    {b.title}
                  </h5>
                  <span className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider shrink-0">
                    {b.ageHours}h ago
                  </span>
                </div>
                <p className="font-geist text-body-md text-on-surface-variant leading-relaxed">
                  {b.description}
                </p>
              </div>
              <button className="text-on-surface-variant hover:text-on-surface transition-colors">
                <MoreVertical className="w-4 h-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
