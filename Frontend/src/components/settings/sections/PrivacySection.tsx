import { ShieldCheck, Lock, AlertTriangle } from "lucide-react";
import { SettingsSection, Subsection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { Switch } from "@/components/ui/Switch";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog";
import { useSettingsStore } from "@/store/settings.store";
import { useRunDangerousAction } from "@/hooks/useSettings";

const FIELDS: { key: keyof ReturnType<typeof useSettingsStore.getState>["draft"]["privacy"]; label: string; description?: string }[] = [
  { key: "storeAudioFiles", label: "Store Audio Files", description: "Raw uploads are retained for replay." },
  { key: "storeTranscripts", label: "Store Transcripts" },
  { key: "storeSummaries", label: "Store AI Summaries" },
  { key: "storeAnalytics", label: "Store Analytics" },
  { key: "searchIndexing", label: "Enable Search Indexing", description: "Required for the vault keyword index." },
  { key: "semanticSearch", label: "Enable Semantic Search", description: "Required for vector retrieval." },
  { key: "allowTeamAccess", label: "Allow Team Access", description: "Workspace teammates can view meeting outputs." },
];

const DANGER_ACTIONS = [
  {
    id: "delete_all_meetings",
    label: "Delete All Meetings",
    description: "Removes every meeting, transcript and derived artifact in this workspace.",
  },
  {
    id: "delete_workspace",
    label: "Delete Workspace",
    description: "Permanently deletes the workspace and revokes all member access.",
  },
  {
    id: "reset_search_index",
    label: "Reset Search Index",
    description: "Rebuild keyword and semantic indexes from scratch. Takes a few minutes.",
  },
  {
    id: "clear_ai_cache",
    label: "Clear AI Cache",
    description: "Forces all AI passes to rerun on next request. Useful after upgrading models.",
  },
];

export function PrivacySection() {
  const draft = useSettingsStore((s) => s.draft.privacy);
  const setSection = useSettingsStore((s) => s.setSection);
  const runDanger = useRunDangerousAction();

  return (
    <SettingsSection
      id="privacy"
      title="Privacy & Security"
      description="What data BriefVoice stores about your meetings — and who can reach it."
    >
      <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-md">
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md flex items-start gap-md">
          <div className="w-9 h-9 rounded-lg bg-tertiary/10 border border-tertiary/30 flex items-center justify-center">
            <Lock className="w-4 h-4 text-tertiary" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
              Data Encryption
            </p>
            <p className="font-geist text-body-md text-on-surface">AES-256 at rest · TLS 1.3 in transit</p>
            <Badge variant="success" className="mt-2 normal-case">
              Compliant
            </Badge>
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-low p-md flex items-start gap-md">
          <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
              Workspace Security
            </p>
            <p className="font-geist text-body-md text-on-surface">SSO enforced · MFA required</p>
            <Badge variant="primary" className="mt-2 normal-case">
              Strong
            </Badge>
          </div>
        </div>
      </div>

      <Subsection title="Retention & Access">
        {FIELDS.map((f) => (
          <SettingsField
            key={f.key}
            label={f.label}
            description={f.description}
            control={
              <Switch
                checked={draft[f.key]}
                onChange={(v) => setSection("privacy", { [f.key]: v } as any)}
              />
            }
          />
        ))}
      </Subsection>

      <div className="p-lg">
        <div className="rounded-xl border border-error-container/60 bg-error-container/10 p-md">
          <div className="flex items-center gap-sm mb-md">
            <AlertTriangle className="w-4 h-4 text-error" />
            <p className="font-mono text-label-md text-error uppercase tracking-widest">
              Danger Zone
            </p>
          </div>
          <div className="space-y-2">
            {DANGER_ACTIONS.map((a) => (
              <div
                key={a.id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-sm rounded-lg border border-error-container/40 p-md bg-surface-container-low"
              >
                <div className="min-w-0">
                  <p className="font-geist text-body-md text-on-surface">{a.label}</p>
                  <p className="font-geist text-body-md text-on-surface-variant">
                    {a.description}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="danger" size="sm">
                      Run
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{a.label}?</DialogTitle>
                      <DialogDescription>{a.description}</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="ghost" size="sm">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => runDanger.mutate(a.id)}
                          disabled={runDanger.isPending}
                        >
                          Confirm
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsSection>
  );
}
