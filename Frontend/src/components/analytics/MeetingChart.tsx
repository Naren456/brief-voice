import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";
import { cn } from "@/lib/cn";

type Range = "7D" | "30D" | "90D";

interface MeetingChartProps {
  data: { label: string; engineering: number; product: number }[];
}

const RANGES: Range[] = ["7D", "30D", "90D"];

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2 shadow-ambient">
      <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} className="font-geist text-body-md flex items-center gap-2">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-on-surface-variant capitalize">{p.name}</span>
          <span className="text-on-surface font-medium ml-2">{p.value}</span>
        </p>
      ))}
    </div>
  );
}

export function MeetingChart({ data }: MeetingChartProps) {
  const [range, setRange] = useState<Range>("30D");

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl p-lg flex flex-col h-full">
      <div className="flex items-center justify-between mb-lg">
        <div>
          <h4 className="font-geist font-semibold text-headline-md text-on-surface">
            Meeting Frequency Analysis
          </h4>
          <p className="font-geist text-body-md text-on-surface-variant">
            Correlation between Engineering vs. Product syncs
          </p>
        </div>
        <div className="flex items-center gap-xs p-0.5 rounded-lg border border-outline-variant bg-surface-container-low">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 h-7 rounded-md font-mono text-label-md tracking-wide transition-colors",
                range === r
                  ? "bg-primary text-on-primary"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="eng-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c0c1ff" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#c0c1ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#464554" strokeDasharray="3 3" vertical={false} opacity={0.35} />
            <XAxis
              dataKey="label"
              stroke="#908fa0"
              tick={{ fontFamily: "JetBrains Mono", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#908fa0"
              tick={{ fontFamily: "JetBrains Mono", fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#464554", strokeDasharray: "3 3" }} />
            <Area
              type="monotone"
              dataKey="engineering"
              name="Engineering"
              stroke="#c0c1ff"
              strokeWidth={2.4}
              fill="url(#eng-fill)"
            />
            <Line
              type="monotone"
              dataKey="product"
              name="Product"
              stroke="#d0bcff"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-lg pt-md mt-md border-t border-outline-variant">
        <div className="flex items-center gap-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="font-mono text-label-md text-on-surface uppercase tracking-wider">
            Engineering
          </span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="w-2.5 h-2.5 rounded-full border border-secondary border-dashed" />
          <span className="font-mono text-label-md text-on-surface uppercase tracking-wider">
            Product Strategy
          </span>
        </div>
      </div>
    </div>
  );
}
