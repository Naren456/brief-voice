import { Moon, Monitor } from "lucide-react";
import { SettingsSection, Subsection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Switch } from "@/components/ui/Switch";
import { useSettingsStore } from "@/store/settings.store";
import type { AccentColor, Density, TranscriptFontSize, Theme } from "@/types/settings";
import { cn } from "@/lib/cn";

const ACCENTS: { value: AccentColor; label: string; swatch: string }[] = [
  { value: "indigo", label: "Indigo", swatch: "bg-[#c0c1ff]" },
  { value: "purple", label: "Purple", swatch: "bg-[#d0bcff]" },
  { value: "emerald", label: "Emerald", swatch: "bg-[#4edea3]" },
  { value: "blue", label: "Blue", swatch: "bg-[#7aa2ff]" },
];

const DENSITY_OPTS: { value: Density; label: string }[] = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "expanded", label: "Expanded" },
];

const FONT_OPTS: { value: TranscriptFontSize; label: string }[] = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

const THEME_OPTS: { value: Theme; label: string; description: string; icon: typeof Moon }[] = [
  { value: "dark", label: "Dark", description: "Default — calibrated for long sessions.", icon: Moon },
  { value: "system", label: "System", description: "Follow OS preference.", icon: Monitor },
];

export function AppearanceSection() {
  const draft = useSettingsStore((s) => s.draft.appearance);
  const setSection = useSettingsStore((s) => s.setSection);
  const set = (next: Partial<typeof draft>) => setSection("appearance", next);

  return (
    <SettingsSection
      id="appearance"
      title="Appearance"
      description="Calibrate density, motion and palette for your environment."
    >
      <Subsection title="Theme">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {THEME_OPTS.map((opt) => {
            const active = draft.theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set({ theme: opt.value })}
                className={cn(
                  "p-md rounded-lg border text-left flex gap-md items-start transition-colors",
                  active
                    ? "border-primary/50 bg-primary/5"
                    : "border-outline-variant bg-surface-container-low hover:border-outline",
                )}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center border",
                    active
                      ? "border-primary/50 text-primary"
                      : "border-outline-variant text-on-surface-variant",
                  )}
                >
                  <opt.icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-geist text-body-md text-on-surface">{opt.label}</p>
                  <p className="font-geist text-body-md text-on-surface-variant">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Subsection>

      <Subsection title="Accent Color">
        <div className="flex flex-wrap items-center gap-sm">
          {ACCENTS.map((a) => {
            const active = draft.accent === a.value;
            return (
              <button
                key={a.value}
                type="button"
                onClick={() => set({ accent: a.value })}
                className={cn(
                  "flex items-center gap-sm px-3 h-9 rounded-lg border font-mono text-label-md uppercase tracking-wider transition-colors",
                  active
                    ? "border-primary/50 bg-primary/10 text-on-surface"
                    : "border-outline-variant text-on-surface-variant hover:border-outline hover:text-on-surface",
                )}
              >
                <span className={cn("w-3 h-3 rounded-full", a.swatch)} />
                {a.label}
              </button>
            );
          })}
        </div>
      </Subsection>

      <Subsection title="Density & Typography">
        <SettingsField
          label="Density"
          description="Compact = data-dense. Expanded = airier rows."
          align="start"
          fullWidth
          control={
            <RadioGroup
              value={draft.density}
              onChange={(v) => set({ density: v })}
              options={DENSITY_OPTS}
            />
          }
        />
        <SettingsField
          label="Transcript Font Size"
          align="start"
          fullWidth
          control={
            <RadioGroup
              value={draft.transcriptFontSize}
              onChange={(v) => set({ transcriptFontSize: v })}
              options={FONT_OPTS}
            />
          }
        />
      </Subsection>

      <Subsection title="Accessibility">
        <SettingsField
          label="Reduce Motion"
          description="Suppress non-essential transitions across the app."
          control={
            <Switch
              checked={draft.reduceMotion}
              onChange={(v) => set({ reduceMotion: v })}
            />
          }
        />
        <SettingsField
          label="High Contrast Mode"
          description="Increase border and text contrast for low-light environments."
          control={
            <Switch
              checked={draft.highContrast}
              onChange={(v) => set({ highContrast: v })}
            />
          }
        />
      </Subsection>
    </SettingsSection>
  );
}
