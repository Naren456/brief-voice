import { CheckCircle2, Plug, Link2Off } from "lucide-react";
import { SettingsSection } from "../SettingsSection";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { useSettingsStore } from "@/store/settings.store";
import type { IntegrationKey } from "@/types/settings";
import { cn } from "@/lib/cn";

interface IntegrationDef {
  key: IntegrationKey;
  name: string;
  description: string;
  gradient: string;
  initials: string;
  options: { key: string; label: string }[];
}

const INTEGRATIONS: IntegrationDef[] = [
  {
    key: "google_calendar",
    name: "Google Calendar",
    description: "Sync events and auto-attach meeting context.",
    gradient: "from-[#4285F4] via-[#34A853] to-[#FBBC04]",
    initials: "GC",
    options: [{ key: "syncEvents", label: "Sync upcoming events" }],
  },
  {
    key: "google_meet",
    name: "Google Meet",
    description: "Auto-import recordings to the vault.",
    gradient: "from-[#00897B] via-[#1A73E8] to-[#34A853]",
    initials: "GM",
    options: [{ key: "autoImport", label: "Auto-import recordings" }],
  },
  {
    key: "zoom",
    name: "Zoom",
    description: "Auto-import recorded meetings.",
    gradient: "from-[#2D8CFF] to-[#1f74e0]",
    initials: "ZM",
    options: [{ key: "autoImport", label: "Auto-import meetings" }],
  },
  {
    key: "ms_teams",
    name: "Microsoft Teams",
    description: "Auto-import recorded calls and channel meetings.",
    gradient: "from-[#5059c9] to-[#7B83EB]",
    initials: "MT",
    options: [{ key: "autoImport", label: "Auto-import meetings" }],
  },
  {
    key: "slack",
    name: "Slack",
    description: "Post summaries and action items into channels.",
    gradient: "from-[#36c5f0] via-[#2eb67d] to-[#ecb22e]",
    initials: "SL",
    options: [
      { key: "sendSummaries", label: "Send summaries" },
      { key: "sendActionItems", label: "Send action items" },
    ],
  },
  {
    key: "notion",
    name: "Notion",
    description: "Push meeting summaries to a database.",
    gradient: "from-[#ffffff] to-[#bdbdbd]",
    initials: "N",
    options: [{ key: "pushSummaries", label: "Push meeting summaries" }],
  },
  {
    key: "jira",
    name: "Jira",
    description: "Convert action items into tickets.",
    gradient: "from-[#0052cc] to-[#2684ff]",
    initials: "JR",
    options: [{ key: "convertActionItems", label: "Convert action items to tickets" }],
  },
  {
    key: "github",
    name: "GitHub",
    description: "Open issues from extracted action items.",
    gradient: "from-[#1f2937] to-[#374151]",
    initials: "GH",
    options: [{ key: "createIssues", label: "Create issues from action items" }],
  },
];

export function IntegrationsSection() {
  const draft = useSettingsStore((s) => s.draft.integrations);
  const setSection = useSettingsStore((s) => s.setSection);

  function toggleConnection(key: IntegrationKey, connected: boolean) {
    setSection("integrations", {
      [key]: {
        ...draft[key],
        connected,
        connectedAt: connected ? new Date().toISOString() : undefined,
        accountLabel: connected ? draft[key].accountLabel ?? "primary account" : undefined,
      },
    } as any);
  }

  function toggleOption(key: IntegrationKey, opt: string, value: boolean) {
    setSection("integrations", {
      [key]: {
        ...draft[key],
        options: { ...draft[key].options, [opt]: value },
      },
    } as any);
  }

  return (
    <SettingsSection
      id="integrations"
      title="Integrations"
      description="Connect BriefVoice to the rest of your operating stack."
    >
      <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-md">
        {INTEGRATIONS.map((def) => {
          const state = draft[def.key];
          const connected = state.connected;
          return (
            <div
              key={def.key}
              className={cn(
                "rounded-xl border bg-surface-container-low p-md flex flex-col gap-md transition-colors",
                connected ? "border-primary/30" : "border-outline-variant hover:border-outline",
              )}
            >
              <div className="flex items-start gap-md">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-geist font-semibold text-xs text-[#111] shrink-0",
                    "bg-gradient-to-br",
                    def.gradient,
                  )}
                >
                  {def.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-sm">
                    <h4 className="font-geist text-on-surface text-body-md font-medium">
                      {def.name}
                    </h4>
                    {connected ? (
                      <Badge variant="success" className="normal-case">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="normal-case">
                        Not Connected
                      </Badge>
                    )}
                  </div>
                  <p className="font-geist text-body-md text-on-surface-variant mt-0.5">
                    {def.description}
                  </p>
                  {connected && state.accountLabel && (
                    <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
                      {state.accountLabel}
                    </p>
                  )}
                </div>
                {connected ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleConnection(def.key, false)}
                  >
                    <Link2Off className="w-3.5 h-3.5" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => toggleConnection(def.key, true)}
                  >
                    <Plug className="w-3.5 h-3.5" />
                    Connect
                  </Button>
                )}
              </div>
              {connected && def.options.length > 0 && (
                <div className="border-t border-outline-variant pt-md space-y-2">
                  {def.options.map((opt) => (
                    <div
                      key={opt.key}
                      className="flex items-center justify-between gap-md"
                    >
                      <span className="font-geist text-body-md text-on-surface-variant">
                        {opt.label}
                      </span>
                      <Switch
                        size="sm"
                        checked={!!state.options[opt.key]}
                        onChange={(v) => toggleOption(def.key, opt.key, v)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SettingsSection>
  );
}
