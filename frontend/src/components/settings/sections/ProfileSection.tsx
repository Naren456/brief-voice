import { KeyRound, Trash2, Upload } from "lucide-react";
import { SettingsSection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/Dialog";
import { useSettingsStore } from "@/store/settings.store";

const TIMEZONES = [
  "Asia/Kolkata",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Australia/Sydney",
].map((tz) => ({ value: tz, label: tz }));

const LANGS = ["English", "Hindi", "Spanish", "French", "German", "Japanese"].map(
  (l) => ({ value: l, label: l }),
);

export function ProfileSection() {
  const draft = useSettingsStore((s) => s.draft.profile);
  const setSection = useSettingsStore((s) => s.setSection);
  const set = (next: Partial<typeof draft>) => setSection("profile", next);

  return (
    <SettingsSection
      id="profile"
      title="Profile"
      description="Personal identity, language and account-level controls."
    >
      <div className="p-lg flex items-center gap-md">
        <Avatar name={draft.fullName} src={draft.avatarUrl} size="xl" />
        <div className="flex-1 min-w-0">
          <p className="font-geist text-body-md text-on-surface">{draft.fullName}</p>
          <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
            {draft.role} · {draft.organization}
          </p>
        </div>
        <Button variant="secondary" size="sm">
          <Upload className="w-3.5 h-3.5" />
          Change photo
        </Button>
      </div>

      <div className="p-lg space-y-md">
        <SettingsField
          label="Full Name"
          control={
            <Input
              value={draft.fullName}
              onChange={(e) => set({ fullName: e.target.value })}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Email"
          description="Used for sign-in and notifications."
          control={
            <Input
              type="email"
              value={draft.email}
              onChange={(e) => set({ email: e.target.value })}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Role"
          control={
            <Input
              value={draft.role}
              onChange={(e) => set({ role: e.target.value })}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Team"
          control={
            <Input
              value={draft.team}
              onChange={(e) => set({ team: e.target.value })}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Organization"
          control={
            <Input
              value={draft.organization}
              onChange={(e) => set({ organization: e.target.value })}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Timezone"
          description="Used to render meeting times and digests."
          control={
            <Select
              value={draft.timezone}
              onChange={(v) => set({ timezone: v })}
              options={TIMEZONES}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Meeting Language"
          description="Default expected language of incoming meetings."
          control={
            <Select
              value={draft.meetingLanguage}
              onChange={(v) => set({ meetingLanguage: v })}
              options={LANGS}
              className="w-72"
            />
          }
        />
        <SettingsField
          label="Preferred Transcript Language"
          control={
            <Select
              value={draft.transcriptLanguage}
              onChange={(v) => set({ transcriptLanguage: v })}
              options={LANGS}
              className="w-72"
            />
          }
        />
      </div>

      <div className="p-lg flex flex-wrap items-center justify-between gap-sm">
        <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest">
          Account actions
        </p>
        <div className="flex items-center gap-sm">
          <Button variant="secondary" size="sm">
            <KeyRound className="w-3.5 h-3.5" />
            Change Password
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="danger" size="sm">
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete account?</DialogTitle>
                <DialogDescription>
                  This permanently removes your meetings, transcripts, summaries and
                  workspace ownership. This cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                </DialogClose>
                <Button variant="danger" size="sm">
                  Delete forever
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </SettingsSection>
  );
}
