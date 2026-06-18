import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  Repeat,
  Shuffle,
  Maximize2,
  AudioLines,
} from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { usePlayerStore } from "@/store/player.store";
import { cn } from "@/lib/cn";
import { formatDuration } from "@/lib/format";

const SPEEDS: Array<1 | 1.25 | 1.5 | 2> = [1, 1.25, 1.5, 2];

function Waveform({ progress }: { progress: number }) {
  const bars = useMemo(
    () =>
      Array.from({ length: 56 }, (_, i) => {
        const seed = Math.sin(i * 0.45) * 0.5 + 0.5;
        const variance = ((i * 7919) % 100) / 100;
        return 5 + Math.round((seed * 0.7 + variance * 0.5) * 26);
      }),
    [],
  );
  const cutoff = Math.floor(bars.length * progress);
  return (
    <div className="w-full h-9 flex items-end gap-[2px]">
      {bars.map((h, i) => (
        <div
          key={i}
          style={{ height: `${h}px` }}
          className={cn(
            "w-[3px] rounded-full transition-colors",
            i < cutoff ? "bg-primary" : "bg-outline-variant/70",
            i === cutoff && "bg-primary scale-y-110",
          )}
        />
      ))}
    </div>
  );
}

export function AudioDock() {
  const {
    current,
    isPlaying,
    positionMs,
    volume,
    speed,
    togglePlay,
    setSpeed,
    setVolume,
    setPosition,
  } = usePlayerStore();
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isPlaying) return;
    let last = performance.now();
    const tick = (t: number) => {
      const dt = t - last;
      last = t;
      const next = positionMs + dt * speed;
      if (current && next >= current.durationMs) {
        setPosition(0);
      } else {
        setPosition(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, speed, current?.durationMs]);

  if (!current) return null;

  const progress = Math.min(1, positionMs / current.durationMs);

  return (
    <footer className="fixed bottom-0 left-0 md:left-64 right-0 z-40 h-20 bg-surface-container/95 backdrop-blur-md border-t border-outline-variant shadow-dock">
      <div className="h-full px-lg flex items-center justify-between gap-lg">
        {/* Left: track info */}
        <div className="flex items-center gap-md min-w-0 w-[26%]">
          <div className="w-11 h-11 rounded-lg bg-surface-container-highest border border-outline-variant flex items-center justify-center shrink-0">
            <AudioLines className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-geist font-medium text-on-surface text-[13px] truncate">
              {current.title}
            </p>
            <p className="font-mono text-label-sm text-on-surface-variant truncate">
              {formatDuration(positionMs)} / {formatDuration(current.durationMs)}
              {current.subtitle && ` • ${current.subtitle}`}
            </p>
          </div>
        </div>

        {/* Center: transport + waveform */}
        <div className="flex-1 flex flex-col items-center gap-2 max-w-3xl">
          <div className="flex items-center gap-lg text-on-surface-variant">
            <button className="hover:text-primary transition-colors">
              <Shuffle className="w-4 h-4" />
            </button>
            <button className="hover:text-primary transition-colors">
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-glow-primary"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>
            <button className="hover:text-primary transition-colors">
              <SkipForward className="w-4 h-4" />
            </button>
            <button className="hover:text-primary transition-colors">
              <Repeat className="w-4 h-4" />
            </button>
          </div>
          <Waveform progress={progress} />
        </div>

        {/* Right: speed + volume */}
        <div className="flex items-center justify-end gap-md w-[26%]">
          <div className="hidden lg:flex items-center gap-1">
            {SPEEDS.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  "px-2 py-1 rounded font-mono text-[10px] tracking-wide transition-colors",
                  speed === s
                    ? "text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {s}x
              </button>
            ))}
          </div>
          <div className="flex items-center gap-sm text-on-surface-variant">
            <Volume2 className="w-4 h-4" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume * 100}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              className="w-20 h-1 accent-primary appearance-none bg-outline-variant rounded-full"
            />
          </div>
          <button className="hidden md:inline-flex hover:text-primary text-on-surface-variant transition-colors">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
}
