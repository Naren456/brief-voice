import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Settings, SettingsSectionKey } from "@/types/settings";
import { DEFAULT_SETTINGS } from "@/services/settings.service";

type Path<T, K extends keyof T = keyof T> = K extends string
  ? T[K] extends object
    ? `${K}` | `${K}.${Path<T[K]>}`
    : `${K}`
  : never;

export type SettingsPath = Path<Settings>;

interface SettingsStore {
  saved: Settings;
  draft: Settings;
  hydrated: boolean;
  setHydrated: (s: Settings) => void;
  setDraft: (next: Partial<Settings>) => void;
  setSection: <K extends SettingsSectionKey>(
    section: K,
    next: Partial<Settings[K]>,
  ) => void;
  setNested: (path: string, value: unknown) => void;
  commit: (saved: Settings) => void;
  discard: () => void;
  isDirty: () => boolean;
}

function setPath<T extends object>(obj: T, path: string, value: unknown): T {
  const segments = path.split(".");
  const next = structuredClone(obj) as Record<string, unknown>;
  let cursor = next;
  for (let i = 0; i < segments.length - 1; i++) {
    const key = segments[i];
    cursor[key] = { ...(cursor[key] as object) };
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[segments[segments.length - 1]] = value;
  return next as T;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      saved: DEFAULT_SETTINGS,
      draft: DEFAULT_SETTINGS,
      hydrated: false,

      setHydrated: (s) => set({ saved: s, draft: s, hydrated: true }),

      setDraft: (next) =>
        set((state) => ({ draft: { ...state.draft, ...next } })),

      setSection: (section, next) =>
        set((state) => ({
          draft: {
            ...state.draft,
            [section]: { ...state.draft[section], ...next },
          },
        })),

      setNested: (path, value) =>
        set((state) => ({ draft: setPath(state.draft, path, value) })),

      commit: (saved) => set({ saved, draft: saved }),

      discard: () => set((state) => ({ draft: state.saved })),

      isDirty: () => {
        const { saved, draft } = get();
        return JSON.stringify(saved) !== JSON.stringify(draft);
      },
    }),
    {
      name: "briefvoice.settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist appearance preferences locally — the rest comes from
        // the server (and is mirrored into `saved` on hydrate).
        saved: { appearance: state.saved.appearance } as Partial<Settings>,
        draft: { appearance: state.draft.appearance } as Partial<Settings>,
      }),
      merge: (persisted: any, current) => {
        if (!persisted) return current;
        return {
          ...current,
          saved: { ...current.saved, ...(persisted.saved ?? {}) },
          draft: { ...current.draft, ...(persisted.draft ?? {}) },
        };
      },
    },
  ),
);
