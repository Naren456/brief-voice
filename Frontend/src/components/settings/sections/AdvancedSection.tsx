import { Copy, Download, RefreshCw, Rocket, Trash2 } from "lucide-react";
import { SettingsSection, Subsection } from "../SettingsSection";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useSettingsStore } from "@/store/settings.store";
import { useRunDangerousAction } from "@/hooks/useSettings";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

const HEALTH_VARIANT: Record<string, { variant: any; label: string; dot: string }> = {
  healthy: { variant: "success", label: "Healthy", dot: "bg-tertiary" },
  degraded: { variant: "warning", label: "Degraded", dot: "bg-error" },
  down: { variant: "warning", label: "Down", dot: "bg-error" },
};

function InfoRow({
  label,
  value,
  mono,
  copyable,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  copyable?: string;
}) {
  const toast = useToast();
  return (
    <div className="flex items-center justify-between gap-md py-2 border-b border-outline-variant last:border-b-0">
      <p className="font-mono text-label-md text-on-surface-variant uppercase tracking-widest">
        {label}
      </p>
      <div className="flex items-center gap-sm">
        <span className={cn("font-geist text-body-md text-on-surface", mono && "font-mono")}>
          {value}
        </span>
        {copyable && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(copyable);
              toast.push({ title: `Copied ${label.toLowerCase()}`, variant: "success" });
            }}
            className="w-7 h-7 inline-flex items-center justify-center rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            aria-label={`Copy ${label}`}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export function AdvancedSection() {
  const advanced = useSettingsStore((s) => s.draft.advanced);
  const runDanger = useRunDangerousAction();
  const health = HEALTH_VARIANT[advanced.health] ?? HEALTH_VARIANT.healthy;

  return (
    <SettingsSection
      id="advanced"
      title="Advanced"
      description="Diagnostics, runtime info and platform-level controls."
    >
      <Subsection title="Runtime">
        <div>
          <InfoRow label="API Endpoint" value={advanced.apiEndpoint} mono copyable={advanced.apiEndpoint} />
          <InfoRow label="Environment" value={advanced.environment} mono />
          <InfoRow label="Version" value={advanced.version} mono />
          <InfoRow label="Build Number" value={advanced.build} mono copyable={advanced.build} />
          <InfoRow
            label="Health Status"
            value={
              <span className="inline-flex items-center gap-sm">
                <span className={cn("w-1.5 h-1.5 rounded-full", health.dot)} />
                <Badge variant={health.variant} className="normal-case">
                  {health.label}
                </Badge>
              </span>
            }
          />
        </div>
      </Subsection>

      <Subsection title="Cache Controls">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <Button
            variant="secondary"
            size="md"
            onClick={() => runDanger.mutate("rebuild_search_index")}
            disabled={runDanger.isPending}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rebuild Search Index
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => runDanger.mutate("clear_cache")}
            disabled={runDanger.isPending}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Cache
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => runDanger.mutate("reprocess_all_meetings")}
            disabled={runDanger.isPending}
          >
            <Rocket className="w-3.5 h-3.5" />
            Reprocess All Meetings
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => runDanger.mutate("download_logs")}
            disabled={runDanger.isPending}
          >
            <Download className="w-3.5 h-3.5" />
            Download Logs
          </Button>
        </div>
      </Subsection>
    </SettingsSection>
  );
}
