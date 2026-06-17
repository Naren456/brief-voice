import { cn } from "@/lib/cn";

interface HeatmapProps {
  data: { keyword: string; values: number[] }[];
  trending: { topic: string; state: "trending" | "stable" | "emerging" }[];
}

function intensityClass(v: number, max: number): string {
  const ratio = v / max;
  if (ratio === 0) return "bg-surface-container-highest";
  if (ratio < 0.25) return "bg-tertiary/15";
  if (ratio < 0.5) return "bg-tertiary/35";
  if (ratio < 0.75) return "bg-tertiary/60";
  return "bg-tertiary";
}

const STATE_VARIANT: Record<string, string> = {
  trending: "text-tertiary bg-tertiary/10",
  stable: "text-on-surface-variant bg-surface-container-highest",
  emerging: "text-secondary bg-secondary/10",
};

export function Heatmap({ data, trending }: HeatmapProps) {
  const max = Math.max(1, ...data.flatMap((r) => r.values));
  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-lg h-full flex flex-col">
      <div>
        <h4 className="font-geist font-semibold text-headline-md text-on-surface mb-1">
          Keyword Heatmap
        </h4>
        <p className="font-geist text-body-md text-on-surface-variant mb-lg">
          Density of technical topics over a 12-month horizon.
        </p>
      </div>

      <div className="space-y-2 mb-lg">
        {data.map((row) => (
          <div key={row.keyword} className="grid grid-cols-[100px_1fr] items-center gap-md">
            <span className="font-mono text-label-md text-on-surface-variant uppercase tracking-wider truncate">
              {row.keyword}
            </span>
            <div className="grid grid-cols-7 gap-1.5">
              {row.values.map((v, i) => (
                <div
                  key={i}
                  title={`${row.keyword}: ${v}`}
                  className={cn("aspect-square rounded-sm", intensityClass(v, max))}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-lg border-t border-outline-variant space-y-2">
        <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest mb-2">
          Trending Topics
        </p>
        {trending.map((t) => (
          <div key={t.topic} className="flex items-center justify-between">
            <span className="font-geist text-body-md text-on-surface">{t.topic}</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded font-mono text-label-sm uppercase tracking-wider capitalize",
                STATE_VARIANT[t.state],
              )}
            >
              {t.state}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
