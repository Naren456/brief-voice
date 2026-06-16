import { SettingsSection } from "../SettingsSection";
import { Badge } from "@/components/ui/Badge";
import { useSettingsStore } from "@/store/settings.store";
import { cn } from "@/lib/cn";

const GB = 1024 ** 3;
const fmtGB = (b: number) => `${(b / GB).toFixed(1)} GB`;

const BREAKDOWN_LABELS: Record<string, string> = {
  audio: "Audio Files",
  transcripts: "Transcripts",
  analytics: "Analytics",
  reports: "Reports",
  vector: "Vector Database",
};

const BREAKDOWN_TINTS: Record<string, string> = {
  audio: "bg-primary",
  transcripts: "bg-secondary",
  analytics: "bg-tertiary",
  reports: "bg-error",
  vector: "bg-on-surface-variant",
};

export function StorageSection() {
  const storage = useSettingsStore((s) => s.draft.storage);
  const pct = Math.min(100, (storage.usageBytes / storage.limitBytes) * 100);

  const entries = Object.entries(storage.breakdownBytes) as [
    keyof typeof storage.breakdownBytes,
    number,
  ][];
  const total = entries.reduce((acc, [, v]) => acc + v, 0);

  return (
    <SettingsSection
      id="storage"
      title="Storage"
      description="Plan usage across audio, transcripts, analytics, reports and vectors."
    >
      <div className="p-lg space-y-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest">
              Total Usage
            </p>
            <h3 className="font-geist font-semibold text-on-surface text-headline-md mt-1">
              {fmtGB(storage.usageBytes)}{" "}
              <span className="font-normal text-on-surface-variant">
                / {fmtGB(storage.limitBytes)}
              </span>
            </h3>
          </div>
          <Badge variant="primary" className="normal-case">
            {storage.plan}
          </Badge>
        </div>

        <div className="h-3 w-full rounded-full bg-surface-container-high overflow-hidden flex">
          {entries.map(([k, v]) => (
            <div
              key={k}
              className={cn("h-full", BREAKDOWN_TINTS[k as string])}
              style={{ width: `${(v / storage.limitBytes) * 100}%` }}
              title={`${BREAKDOWN_LABELS[k]} — ${fmtGB(v)}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
          <span>{pct.toFixed(1)}% used</span>
          <span>{fmtGB(storage.limitBytes - storage.usageBytes)} available</span>
        </div>
      </div>

      <div className="p-lg grid grid-cols-1 md:grid-cols-2 gap-md">
        {entries.map(([k, v]) => (
          <div
            key={k}
            className="rounded-lg border border-outline-variant bg-surface-container-low p-md flex items-start justify-between gap-md"
          >
            <div>
              <div className="flex items-center gap-sm mb-1">
                <span className={cn("w-2 h-2 rounded-full", BREAKDOWN_TINTS[k as string])} />
                <p className="font-geist text-body-md text-on-surface">
                  {BREAKDOWN_LABELS[k as string]}
                </p>
              </div>
              <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
                {((v / total) * 100).toFixed(1)}% of footprint
              </p>
            </div>
            <p className="font-geist font-semibold text-on-surface text-body-md">{fmtGB(v)}</p>
          </div>
        ))}
      </div>
    </SettingsSection>
  );
}
