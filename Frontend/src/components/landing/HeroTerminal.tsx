import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * HeroTerminal — a live, self-typing terminal for the landing hero.
 *
 * It streams the BriefVoice ingestion pipeline one line at a time with a
 * blinking caret, then loops, so the first thing a visitor sees is the
 * product actually "working". Honors prefers-reduced-motion by rendering the
 * full transcript statically.
 */

type Tone = "cmd" | "muted" | "accent" | "success" | "primary";

interface TermLine {
  readonly prompt?: string;
  readonly tag?: string;
  readonly text: string;
  readonly tone: Tone;
  /** Skip the per-character typewriter and reveal instantly. */
  readonly instant?: boolean;
}

const LINES: readonly TermLine[] = [
  { prompt: "$", text: 'briefvoice ingest "Q3-planning.mp3"', tone: "cmd" },
  { tag: "upload", text: "153.4 MB → ingestion edge", tone: "muted" },
  { tag: "diarize", text: "3 speakers identified", tone: "accent" },
  { tag: "transcribe", text: "4,812 words · 38:24 captured", tone: "success" },
  { tag: "summary", text: "6 decisions · 9 discussion points", tone: "accent" },
  { tag: "actions", text: "5 owners · 3 deadlines extracted", tone: "success" },
  { tag: "vector", text: "embedded → qdrant[briefvoice]", tone: "accent" },
  { prompt: "✓", text: "intelligence ready — open workspace", tone: "primary", instant: true },
];

const TONE: Record<Tone, string> = {
  cmd: "text-on-surface",
  muted: "text-on-surface-variant/70",
  accent: "text-secondary",
  success: "text-tertiary",
  primary: "text-primary font-medium",
};

function Caret() {
  return (
    <span className="hero-caret ml-0.5 inline-block h-[15px] w-[7px] translate-y-[2px] rounded-[1px] bg-primary/90" />
  );
}

function Row({
  line,
  text,
  active,
}: {
  line: TermLine;
  text: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-baseline gap-2 font-mono text-[12px] leading-[1.75] tabular-nums md:text-[13px]">
      {line.prompt ? (
        <span className="shrink-0 select-none text-primary/70">{line.prompt}</span>
      ) : null}
      {line.tag ? (
        <span className="w-[78px] shrink-0 select-none text-on-surface-variant/45">
          {line.tag}
        </span>
      ) : null}
      <span className={cn("min-w-0 break-words", TONE[line.tone])}>{text}</span>
      {active ? <Caret /> : null}
      {!active && line.tag ? (
        <span className="ml-auto shrink-0 select-none text-tertiary/90">✓</span>
      ) : null}
    </div>
  );
}

export function HeroTerminal() {
  const reduce = useReducedMotion();
  const [count, setCount] = useState(0); // fully revealed lines
  const [partial, setPartial] = useState(""); // typing buffer for LINES[count]
  const [loop, setLoop] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduce) {
      setCount(LINES.length);
      setPartial("");
      return;
    }

    let cancelled = false;
    let line = 0;
    let char = 0;

    const clear = () => {
      if (timer.current) clearTimeout(timer.current);
    };
    const wait = (ms: number, fn: () => void) => {
      clear();
      timer.current = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
    };

    const tick = () => {
      if (cancelled) return;

      // Sequence finished — hold the final frame, then restart the loop.
      if (line >= LINES.length) {
        wait(2600, () => {
          line = 0;
          char = 0;
          setCount(0);
          setPartial("");
          setLoop((k) => k + 1);
          wait(360, tick);
        });
        return;
      }

      const current = LINES[line];

      const commitLine = () => {
        setCount(line + 1);
        setPartial("");
        line += 1;
        char = 0;
        wait(current.tag ? 240 : 360, tick);
      };

      if (current.instant) {
        setPartial(current.text);
        wait(280, commitLine);
        return;
      }

      if (char < current.text.length) {
        char += 1;
        setPartial(current.text.slice(0, char));
        const ch = current.text[char - 1];
        const delay = ch === " " ? 24 : 14 + Math.random() * 30;
        wait(delay, tick);
      } else {
        commitLine();
      }
    };

    wait(520, tick);
    return () => {
      cancelled = true;
      clear();
    };
  }, [reduce]);

  const done = count >= LINES.length;

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-outline-variant/60 bg-surface-container/40 shadow-2xl backdrop-blur-2xl"
      role="img"
      aria-label="BriefVoice ingestion pipeline terminal: upload, diarization, transcription, summary, action items, and semantic indexing."
    >
      <style>{`
        @keyframes heroCaretBlink { 0%, 55% { opacity: 1 } 56%, 100% { opacity: 0 } }
        .hero-caret { animation: heroCaretBlink 1.05s steps(1) infinite; }
        @keyframes heroRoutePulse { from { transform: translateX(-120%) } to { transform: translateX(320%) } }
        .hero-route-pulse { animation: heroRoutePulse 2.6s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .hero-caret { animation: none; opacity: 1; }
          .hero-route-pulse { animation: none; }
        }
      `}</style>

      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-outline-variant/40 bg-surface-container-high/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-error/80" />
          <span className="h-3 w-3 rounded-full bg-[#F5A623]/80" />
          <span className="h-3 w-3 rounded-full bg-tertiary/80" />
          <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.18em] text-on-surface-variant/70">
            briefvoice — pipeline
          </span>
        </div>
        <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-tertiary/90">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary/70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tertiary" />
          </span>
          live
        </span>
      </div>

      {/* Body */}
      <div
        className="relative px-5 py-5 md:px-6 md:py-6"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      >
        {/* ambient glow */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/20 blur-[60px]" />
        <div className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-tertiary/10 blur-[60px]" />

        {/* fixed height keeps the loop from shifting layout */}
        <div className="relative z-[1] flex min-h-[232px] flex-col justify-start gap-0.5 md:min-h-[248px]">
          {LINES.slice(0, count).map((l, i) => (
            <motion.div
              key={`${loop}-${i}`}
              initial={reduce ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              <Row line={l} text={l.text} />
            </motion.div>
          ))}

          {!done ? <Row line={LINES[count]} text={partial} active /> : null}

          {done ? (
            <Row line={{ prompt: "›", text: "", tone: "cmd" }} text="" active />
          ) : null}
        </div>

        {/* route pulse footer */}
        <div className="relative z-[1] mt-5 grid grid-cols-[8px_1fr_8px_1fr_8px_1fr_8px] items-center gap-2">
          {[0, 1, 2, 3].map((n) => (
            <RouteSegment key={n} node first={n === 0} />
          ))}
        </div>
      </div>
    </div>
  );
}

function RouteSegment({ node, first }: { node: boolean; first?: boolean }) {
  return (
    <>
      {!first ? (
        <span className="relative h-px overflow-hidden bg-outline-variant/40">
          <span className="hero-route-pulse absolute inset-y-0 left-0 w-2/5 bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
        </span>
      ) : null}
      {node ? (
        <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_14px_rgba(192,193,255,0.55)]" />
      ) : null}
    </>
  );
}
