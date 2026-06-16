import { Copy } from "lucide-react";
import { SettingsSection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { useSettingsStore } from "@/store/settings.store";
import { useToast } from "@/components/ui/Toast";
import type { NamingFormat, RetentionPolicy } from "@/types/settings";

const RETENTION_OPTS: { value: RetentionPolicy; label: string }[] = [
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "180d", label: "180 Days" },
  { value: "1y", label: "1 Year" },
  { value: "forever", label: "Forever" },
];

const NAMING_OPTS: { value: NamingFormat; label: string; description?: string }[] = [
  {
    value: "name_date",
    label: "Meeting Name + Date",
    description: "Q3 Strategy — 2026-06-15",
  },
  {
    value: "project_date",
    label: "Project + Date",
    description: "BriefVoice — 2026-06-15",
  },
  {
    value: "custom",
    label: "Custom Pattern",
    description: "Use {project}, {date:YYYY-MM-DD}, {speakers}",
  },
];

export function WorkspaceSection() {
  const draft = useSettingsStore((s) => s.draft.workspace);
  const setSection = useSettingsStore((s) => s.setSection);
  const set = (next: Partial<typeof draft>) => setSection("workspace", next);
  const toast = useToast();

  return (
    <SettingsSection
      id="workspace"
      title="Workspace"
      description="Organizational defaults applied to every ingested meeting."
    >
      <div className="p-lg space-y-md">
        <SettingsField
          label="Workspace Name"
          control={
            <Input
              value={draft.workspaceName}
              onChange={(e) => set({ workspaceName: e.target.value })}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Workspace ID"
          description="Used in API calls and integrations."
          control={
            <div className="flex items-center gap-2 w-72">
              <Input value={draft.workspaceId} readOnly className="font-mono" />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(draft.workspaceId);
                  toast.push({
                    title: "Workspace ID copied",
                    variant: "success",
                  });
                }}
                className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                aria-label="Copy"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          }
        />
        <SettingsField
          label="Default Meeting Folder"
          control={
            <Input
              value={draft.defaultFolder}
              onChange={(e) => set({ defaultFolder: e.target.value })}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Default Upload Location"
          control={
            <Input
              value={draft.defaultUploadLocation}
              onChange={(e) => set({ defaultUploadLocation: e.target.value })}
              className="w-72 font-mono"
            />
          }
        />
        <SettingsField
          label="Default Meeting Retention Policy"
          description="Determines when raw audio is purged."
          control={
            <Select
              value={draft.retentionPolicy}
              onChange={(v) => set({ retentionPolicy: v })}
              options={RETENTION_OPTS}
              className="w-72"
            />
          }
        />
      </div>

      <div className="p-lg space-y-md">
        <SettingsField
          label="Meeting Naming Format"
          description="How new meetings should be auto-named."
          align="start"
          fullWidth
          control={
            <RadioGroup
              value={draft.namingFormat}
              onChange={(v) => set({ namingFormat: v })}
              options={NAMING_OPTS}
              layout="vertical"
            />
          }
        />
        {draft.namingFormat === "custom" && (
          <SettingsField
            label="Custom Pattern"
            description="Tokens: {project}, {date:FORMAT}, {speakers}, {duration}"
            control={
              <Input
                value={draft.customNamingPattern ?? ""}
                onChange={(e) => set({ customNamingPattern: e.target.value })}
                className="w-72 font-mono"
              />
            }
          />
        )}
      </div>

      <div className="p-lg space-y-md">
        <SettingsField
          label="Auto-organize meetings"
          description="Group meetings into folders based on calendar context."
          control={
            <Switch
              checked={draft.autoOrganize}
              onChange={(v) => set({ autoOrganize: v })}
            />
          }
        />
        <SettingsField
          label="Auto-tag meetings"
          description="Apply topical tags from the AI topic clustering pass."
          control={
            <Switch
              checked={draft.autoTag}
              onChange={(v) => set({ autoTag: v })}
            />
          }
        />
        <SettingsField
          label="Auto-archive inactive meetings"
          description="Meetings idle for 60 days are archived from the vault."
          control={
            <Switch
              checked={draft.autoArchive}
              onChange={(v) => set({ autoArchive: v })}
            />
          }
        />
      </div>
    </SettingsSection>
  );
}
