import { create } from "zustand";

interface NowPlaying {
  meetingId: string;
  title: string;
  subtitle?: string;
  durationMs: number;
}

interface PlayerState {
  current: NowPlaying | null;
  isPlaying: boolean;
  positionMs: number;
  volume: number;
  speed: 1 | 1.25 | 1.5 | 2;
  seek: (ms: number) => void;
  setPosition: (ms: number) => void;
  togglePlay: () => void;
  play: (m: NowPlaying) => void;
  pause: () => void;
  setSpeed: (s: PlayerState["speed"]) => void;
  setVolume: (v: number) => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  current: {
    meetingId: "m_001",
    title: "Q3 Infrastructure & Prisma Migrations",
    subtitle: "Oct 24 • AI Generated Brief",
    durationMs: 28 * 60_000 + 12_000,
  },
  isPlaying: false,
  positionMs: 185_000,
  volume: 0.75,
  speed: 1,
  seek: (ms) => set({ positionMs: ms }),
  setPosition: (ms) => set({ positionMs: ms }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  play: (m) =>
    set({ current: m, isPlaying: true, positionMs: 0 }),
  pause: () => set({ isPlaying: false }),
  setSpeed: (s) => set({ speed: s }),
  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
}));
