import { cn } from "@/lib/cn";

interface SliderProps {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  ticks?: number[];
  formatValue?: (v: number) => string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className,
  ticks,
  formatValue,
}: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={cn("space-y-2", className)}>
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1 bg-surface-container-high rounded-full" />
        <div
          className="absolute h-1 bg-primary rounded-full pointer-events-none"
          style={{ width: `${pct}%` }}
        />
        {ticks && (
          <div className="absolute inset-x-0 flex justify-between pointer-events-none">
            {ticks.map((t) => {
              const tpct = ((t - min) / (max - min)) * 100;
              return (
                <span
                  key={t}
                  style={{ left: `${tpct}%` }}
                  className="absolute -translate-x-1/2 w-px h-1.5 bg-outline-variant"
                />
              );
            })}
          </div>
        )}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="relative z-10 w-full bg-transparent appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary
                     [&::-webkit-slider-thumb]:border-2
                     [&::-webkit-slider-thumb]:border-surface
                     [&::-webkit-slider-thumb]:shadow-glow-primary
                     [&::-moz-range-thumb]:w-4
                     [&::-moz-range-thumb]:h-4
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-primary
                     [&::-moz-range-thumb]:border-2
                     [&::-moz-range-thumb]:border-surface
                     focus:outline-none"
        />
      </div>
      <div className="flex items-center justify-between font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span className="text-on-surface">
          {formatValue ? formatValue(value) : value}
        </span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  );
}
