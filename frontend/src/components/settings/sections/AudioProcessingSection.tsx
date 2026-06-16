import { SettingsSection, Subsection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { useSettingsStore } from "@/store/settings.store";
import type { AudioQuality } from "@/types/settings";

const QUALITY_OPTS: { value: AudioQuality; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "very_high", label: "Very High" },
];

export function AudioProcessingSection() {
  const draft = useSettingsStore((s) => s.draft.audio);
  const setSection = useSettingsStore((s) => s.setSection);
  const set = (next: Partial<typeof draft>) => setSection("audio", next);

  return (
    <SettingsSection
      id="audio"
      title="Audio Processing"
      description="Tune the diarization and signal-conditioning pipeline."
    >
      <Subsection title="Pipeline Quality">
        <SettingsField
          label="Audio Quality Threshold"
          description="Recordings below this floor will be flagged and reprocessed."
          align="start"
          fullWidth
          control={
            <RadioGroup
              value={draft.qualityThreshold}
              onChange={(v) => set({ qualityThreshold: v })}
              options={QUALITY_OPTS}
            />
          }
        />
      </Subsection>

      <Subsection title="Capabilities">
        <SettingsField
          label="Speaker Diarization"
          description="Separate audio into per-speaker streams."
          control={
            <Switch
              checked={draft.diarization}
              onChange={(v) => set({ diarization: v })}
            />
          }
        />
        <SettingsField
          label="Speaker Identification"
          description="Match speakers to your team directory."
          control={
            <Switch
              checked={draft.speakerIdentification}
              onChange={(v) => set({ speakerIdentification: v })}
            />
          }
        />
        <SettingsField
          label="Noise Reduction"
          description="Suppress ambient noise during transcription."
          control={
            <Switch
              checked={draft.noiseReduction}
              onChange={(v) => set({ noiseReduction: v })}
            />
          }
        />
        <SettingsField
          label="Filler Word Removal"
          description="Strip “um”, “uh”, “like” from final transcripts."
          control={
            <Switch
              checked={draft.fillerWordRemoval}
              onChange={(v) => set({ fillerWordRemoval: v })}
            />
          }
        />
        <SettingsField
          label="Language Auto Detection"
          description="Detect spoken language without manual hints."
          control={
            <Switch
              checked={draft.languageAutoDetect}
              onChange={(v) => set({ languageAutoDetect: v })}
            />
          }
        />
      </Subsection>

      <Subsection title="Plan Limits" description="Read-only — based on your current plan.">
        <SettingsField
          label="Max Upload Size"
          control={
            <Badge variant="primary">{draft.maxUploadSizeMb} MB / file</Badge>
          }
        />
        <SettingsField
          label="Supported Formats"
          control={
            <div className="flex flex-wrap items-center gap-xs">
              {draft.supportedFormats.map((f) => (
                <Badge key={f} variant="outline">
                  {f}
                </Badge>
              ))}
            </div>
          }
        />
      </Subsection>
    </SettingsSection>
  );
}
