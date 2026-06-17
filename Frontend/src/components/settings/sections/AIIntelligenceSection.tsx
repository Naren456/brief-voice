import { Sparkles } from "lucide-react";
import { SettingsSection, Subsection } from "../SettingsSection";
import { SettingsField } from "../SettingsField";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { Switch } from "@/components/ui/Switch";
import { Slider } from "@/components/ui/Slider";
import { Badge } from "@/components/ui/Badge";
import { useSettingsStore } from "@/store/settings.store";
import type { SummaryDetail } from "@/types/settings";

const DETAIL_OPTS: { value: SummaryDetail; label: string }[] = [
  { value: "concise", label: "Concise" },
  { value: "standard", label: "Standard" },
  { value: "detailed", label: "Detailed" },
  { value: "executive", label: "Executive" },
];

export function AIIntelligenceSection() {
  const draft = useSettingsStore((s) => s.draft.ai);
  const setNested = useSettingsStore((s) => s.setNested);
  const setSection = useSettingsStore((s) => s.setSection);

  return (
    <SettingsSection
      id="ai"
      title="AI Intelligence"
      description="Tune how summaries, action items and topic clusters are extracted from your meetings."
      badge={
        <Badge variant="ai">
          <Sparkles className="w-3 h-3" />
          Magic
        </Badge>
      }
    >
      <Subsection
        title="Summary Settings"
        description="Control the verbosity and shape of generated meeting briefs."
      >
        <SettingsField
          label="Summary Detail Level"
          description="Concise = bullet points. Executive = narrative briefing."
          align="start"
          fullWidth
          control={
            <RadioGroup
              value={draft.summary.detailLevel}
              onChange={(v) =>
                setNested("ai.summary.detailLevel", v)
              }
              options={DETAIL_OPTS}
            />
          }
        />
        <SettingsField
          label="Generate Executive Brief"
          description="A 3-paragraph narrative for non-technical stakeholders."
          control={
            <Switch
              checked={draft.summary.generateExecutiveBrief}
              onChange={(v) => setNested("ai.summary.generateExecutiveBrief", v)}
            />
          }
        />
        <SettingsField
          label="Generate Discussion Points"
          control={
            <Switch
              checked={draft.summary.generateDiscussionPoints}
              onChange={(v) => setNested("ai.summary.generateDiscussionPoints", v)}
            />
          }
        />
        <SettingsField
          label="Generate Open Questions"
          control={
            <Switch
              checked={draft.summary.generateOpenQuestions}
              onChange={(v) => setNested("ai.summary.generateOpenQuestions", v)}
            />
          }
        />
        <SettingsField
          label="Generate Next Steps"
          control={
            <Switch
              checked={draft.summary.generateNextSteps}
              onChange={(v) => setNested("ai.summary.generateNextSteps", v)}
            />
          }
        />
        <SettingsField
          label="Generate Key Decisions"
          control={
            <Switch
              checked={draft.summary.generateKeyDecisions}
              onChange={(v) => setNested("ai.summary.generateKeyDecisions", v)}
            />
          }
        />
      </Subsection>

      <Subsection
        title="Action Items"
        description="How aggressively to extract owners, deadlines and priority."
      >
        <SettingsField
          label="Auto Extract Action Items"
          control={
            <Switch
              checked={draft.actionItems.autoExtract}
              onChange={(v) => setNested("ai.actionItems.autoExtract", v)}
            />
          }
        />
        <SettingsField
          label="Auto Assign Owners"
          control={
            <Switch
              checked={draft.actionItems.autoAssignOwners}
              onChange={(v) => setNested("ai.actionItems.autoAssignOwners", v)}
            />
          }
        />
        <SettingsField
          label="Deadline Detection"
          control={
            <Switch
              checked={draft.actionItems.detectDeadlines}
              onChange={(v) => setNested("ai.actionItems.detectDeadlines", v)}
            />
          }
        />
        <SettingsField
          label="Priority Detection"
          control={
            <Switch
              checked={draft.actionItems.detectPriority}
              onChange={(v) => setNested("ai.actionItems.detectPriority", v)}
            />
          }
        />
        <SettingsField
          label="Confidence Threshold"
          description="Only surface action items above this likelihood."
          align="start"
          fullWidth
          control={
            <div className="w-full max-w-md">
              <Slider
                value={draft.actionItems.confidenceThreshold}
                onChange={(v) =>
                  setSection("ai", {
                    actionItems: { ...draft.actionItems, confidenceThreshold: v },
                  })
                }
                min={0}
                max={100}
                ticks={[0, 25, 50, 75, 100]}
                formatValue={(v) => `${v}%`}
              />
            </div>
          }
        />
      </Subsection>

      <Subsection
        title="Topic Detection"
        description="What patterns to look for across your meeting corpus."
      >
        <SettingsField
          label="Enable Topic Clustering"
          control={
            <Switch
              checked={draft.topics.topicClustering}
              onChange={(v) => setNested("ai.topics.topicClustering", v)}
            />
          }
        />
        <SettingsField
          label="Enable Trend Detection"
          control={
            <Switch
              checked={draft.topics.trendDetection}
              onChange={(v) => setNested("ai.topics.trendDetection", v)}
            />
          }
        />
        <SettingsField
          label="Enable Recurring Topic Analysis"
          control={
            <Switch
              checked={draft.topics.recurringTopicAnalysis}
              onChange={(v) => setNested("ai.topics.recurringTopicAnalysis", v)}
            />
          }
        />
        <SettingsField
          label="Enable Meeting Similarity Detection"
          description="Detect when meetings rehash previously-resolved topics."
          control={
            <Switch
              checked={draft.topics.similarityDetection}
              onChange={(v) => setNested("ai.topics.similarityDetection", v)}
            />
          }
        />
      </Subsection>
    </SettingsSection>
  );
}
