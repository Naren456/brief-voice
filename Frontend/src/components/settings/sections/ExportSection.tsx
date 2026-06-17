import { SettingsSection, Subsection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Switch } from "@/components/ui/Switch";
import { useSettingsStore } from "@/store/settings.store";
import type { ExportFormat, ExportTemplate } from "@/types/settings";

const FORMAT_OPTS: { value: ExportFormat; label: string }[] = [
  { value: "pdf", label: "PDF" },
  { value: "markdown", label: "Markdown" },
  { value: "docx", label: "DOCX" },
  { value: "html", label: "HTML" },
];

const TEMPLATE_OPTS: { value: ExportTemplate; label: string; description: string }[] = [
  {
    value: "executive",
    label: "Executive",
    description: "Narrative brief for leadership consumption.",
  },
  {
    value: "technical",
    label: "Technical",
    description: "Verbose transcript-anchored breakdown.",
  },
  {
    value: "management",
    label: "Management",
    description: "Decisions, action items, blockers — top of mind.",
  },
  {
    value: "custom",
    label: "Custom",
    description: "Bring your own template via the editor.",
  },
];

const INCLUDE_FIELDS: { key: keyof ReturnType<typeof useSettingsStore.getState>["draft"]["exportPrefs"]["include"]; label: string }[] = [
  { key: "transcript", label: "Transcript" },
  { key: "summary", label: "Summary" },
  { key: "actionItems", label: "Action Items" },
  { key: "analytics", label: "Analytics" },
  { key: "speakerBreakdown", label: "Speaker Breakdown" },
  { key: "aiInsights", label: "AI Insights" },
];

export function ExportSection() {
  const draft = useSettingsStore((s) => s.draft.exportPrefs);
  const setSection = useSettingsStore((s) => s.setSection);
  const setNested = useSettingsStore((s) => s.setNested);
  const set = (next: Partial<typeof draft>) => setSection("exportPrefs", next);

  return (
    <SettingsSection
      id="exportPrefs"
      title="Export & Reports"
      description="How meeting intelligence is packaged when you export."
    >
      <Subsection title="Default Format">
        <SettingsField
          label="Default Export Format"
          align="start"
          fullWidth
          control={
            <RadioGroup
              value={draft.defaultFormat}
              onChange={(v) => set({ defaultFormat: v })}
              options={FORMAT_OPTS}
            />
          }
        />
      </Subsection>

      <Subsection title="Include in Exports">
        {INCLUDE_FIELDS.map((f) => (
          <SettingsField
            key={f.key}
            label={f.label}
            control={
              <Switch
                checked={draft.include[f.key]}
                onChange={(v) => setNested(`exportPrefs.include.${f.key}`, v)}
              />
            }
          />
        ))}
      </Subsection>

      <Subsection title="Export Template">
        <SettingsField
          label="Choose a template"
          align="start"
          fullWidth
          control={
            <RadioGroup
              value={draft.template}
              onChange={(v) => set({ template: v })}
              options={TEMPLATE_OPTS}
              layout="vertical"
            />
          }
        />
      </Subsection>

      <Subsection title="Automation">
        <SettingsField
          label="Auto Export After Processing"
          description="Generate an export the moment the pipeline finishes."
          control={
            <Switch
              checked={draft.autoExportAfterProcessing}
              onChange={(v) => set({ autoExportAfterProcessing: v })}
            />
          }
        />
      </Subsection>
    </SettingsSection>
  );
}
