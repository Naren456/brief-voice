import { motion } from "framer-motion";
import { BarChart3, Gauge, MicVocal, Target } from "lucide-react";
import { MetricCard } from "@/components/analytics/MetricCard";
import { MeetingChart } from "@/components/analytics/MeetingChart";
import { Heatmap } from "@/components/analytics/Heatmap";
import { BottlenecksFeed } from "@/components/analytics/BottlenecksFeed";
import { Skeleton } from "@/components/ui/Skeleton";
import { useAnalyticsOverview } from "@/hooks/useAnalytics";
import { EmptyState } from "@/components/ui/EmptyState";

export function Analytics() {
  const { data, isLoading } = useAnalyticsOverview();

  if (isLoading) {
    return (
      <div className="p-lg max-w-7xl mx-auto space-y-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[420px] rounded-xl" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-2xl">
        <EmptyState
          icon={BarChart3}
          title="Analytics unavailable"
          description="The intelligence stream hasn't produced metrics yet."
        />
      </div>
    );
  }

  const maxTrend = Math.max(1, ...data.velocityTrend);

  return (
    <div className="p-lg max-w-7xl mx-auto space-y-xl">
      <motion.section
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col gap-xs"
      >
        <h2 className="font-geist font-semibold text-headline-lg text-on-surface">
          Global Intelligence Analytics
        </h2>
        <p className="font-geist text-body-md text-on-surface-variant">
          Real-time performance metrics across all organizational streams.
        </p>
      </motion.section>

      {/* Top metrics */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        <MetricCard
          label="Total Meeting Velocity"
          value={data.meetingVelocityHoursPerWeek.toFixed(1)}
          unit="h/wk"
          icon={Gauge}
          tone="primary"
          delta={{ value: data.velocityChangePercent, positive: data.velocityChangePercent >= 0 }}
        >
          <div className="mt-md flex gap-1 items-end h-8">
            {data.velocityTrend.map((v, i) => (
              <div
                key={i}
                style={{ height: `${(v / maxTrend) * 100}%` }}
                className="flex-1 bg-primary/40 rounded-t"
              />
            ))}
          </div>
        </MetricCard>

        <MetricCard
          label="Avg Speaking Clarity"
          value={data.averageSpeakingClarity.toFixed(1)}
          unit="%"
          icon={MicVocal}
          tone="secondary"
        >
          <div className="mt-md flex items-center gap-sm">
            <div className="flex-1 h-[3px] bg-outline-variant rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary"
                style={{ width: `${data.averageSpeakingClarity}%` }}
              />
            </div>
            <span className="font-mono text-label-sm text-secondary uppercase tracking-wider">
              Optimal
            </span>
          </div>
        </MetricCard>

        <div className="bg-surface-container border border-outline-variant rounded-xl p-lg flex items-center justify-between hover:border-outline transition-colors">
          <div className="space-y-xl">
            <div>
              <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-wider">
                Action Item Completion
              </p>
              <h3 className="font-geist font-semibold text-display-lg text-on-surface mt-xs leading-none">
                {data.actionItemCompletion}
                <span className="font-geist text-headline-md font-normal text-on-surface-variant ml-1">
                  %
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-sm">
              <span className="w-2 h-2 rounded-full bg-tertiary" />
              <span className="font-mono text-label-md text-on-surface-variant uppercase tracking-wider">
                {data.completedActionItems.toLocaleString()} Completed
              </span>
            </div>
          </div>
          <div className="relative w-24 h-24">
            <svg viewBox="0 0 96 96" className="w-full h-full -rotate-90">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#464554" strokeWidth="8" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#4edea3"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(data.actionItemCompletion / 100) * 251.2} 251.2`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Target className="w-6 h-6 text-tertiary" />
            </div>
          </div>
        </div>
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        <div className="lg:col-span-8">
          <MeetingChart data={data.meetingFrequency} />
        </div>
        <div className="lg:col-span-4">
          <Heatmap data={data.keywordHeatmap} trending={data.trendingTopics} />
        </div>
      </section>

      {/* Bottlenecks feed */}
      <BottlenecksFeed items={data.bottlenecks} />
    </div>
  );
}
