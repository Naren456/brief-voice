import { SettingsSection, Subsection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { Switch } from "@/components/ui/Switch";
import { useSettingsStore } from "@/store/settings.store";

const TRIGGERS: { key: keyof ReturnType<typeof useSettingsStore.getState>["draft"]["notifications"]["triggers"]; label: string; description?: string }[] = [
  { key: "processingComplete", label: "Meeting Processing Complete" },
  { key: "actionItemsGenerated", label: "Action Items Generated" },
  { key: "transcriptReady", label: "Transcript Ready" },
  { key: "summaryReady", label: "Summary Ready" },
  { key: "weeklyAnalytics", label: "Weekly Analytics Available" },
  { key: "storageNearLimit", label: "Storage Near Limit", description: "Notify at 80% of plan quota." },
  { key: "integrationFailures", label: "Integration Failures" },
  { key: "dailyDigest", label: "Daily Digest" },
  { key: "weeklyDigest", label: "Weekly Digest" },
];

export function NotificationsSection() {
  const draft = useSettingsStore((s) => s.draft.notifications);
  const setNested = useSettingsStore((s) => s.setNested);

  return (
    <SettingsSection
      id="notifications"
      title="Notifications"
      description="Choose where you receive intelligence alerts and what triggers them."
    >
      <Subsection title="Channels">
        <SettingsField
          label="Email Notifications"
          description="Sent to your verified address."
          control={
            <Switch
              checked={draft.channels.email}
              onChange={(v) => setNested("notifications.channels.email", v)}
            />
          }
        />
        <SettingsField
          label="Push Notifications"
          description="Requires the BriefVoice desktop app."
          control={
            <Switch
              checked={draft.channels.push}
              onChange={(v) => setNested("notifications.channels.push", v)}
            />
          }
        />
        <SettingsField
          label="In-App Notifications"
          control={
            <Switch
              checked={draft.channels.inApp}
              onChange={(v) => setNested("notifications.channels.inApp", v)}
            />
          }
        />
      </Subsection>

      <Subsection
        title="Notify Me When…"
        description="These triggers control what pings you across the selected channels."
      >
        {TRIGGERS.map((t) => (
          <SettingsField
            key={t.key}
            label={t.label}
            description={t.description}
            control={
              <Switch
                checked={draft.triggers[t.key]}
                onChange={(v) => setNested(`notifications.triggers.${t.key}`, v)}
              />
            }
          />
        ))}
      </Subsection>
    </SettingsSection>
  );
}
