import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Search } from "lucide-react";
import { TooltipProvider } from "@/components/ui/Tooltip";
import { SettingsNav, SETTINGS_NAV } from "@/components/settings/SettingsNav";
import { SaveBar } from "@/components/settings/SaveBar";
import { ProfileSection } from "@/components/settings/sections/ProfileSection";
import { WorkspaceSection } from "@/components/settings/sections/WorkspaceSection";
import { AIIntelligenceSection } from "@/components/settings/sections/AIIntelligenceSection";
import { AudioProcessingSection } from "@/components/settings/sections/AudioProcessingSection";
import { NotificationsSection } from "@/components/settings/sections/NotificationsSection";
import { IntegrationsSection } from "@/components/settings/sections/IntegrationsSection";
import { ExportSection } from "@/components/settings/sections/ExportSection";
import { PrivacySection } from "@/components/settings/sections/PrivacySection";
import { StorageSection } from "@/components/settings/sections/StorageSection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { AdvancedSection } from "@/components/settings/sections/AdvancedSection";
import { Skeleton } from "@/components/ui/Skeleton";
import { Accordion } from "@/components/ui/Accordion";
import { useSettingsStore } from "@/store/settings.store";
import { useSaveSettings, useSettingsBootstrap } from "@/hooks/useSettings";

const SECTION_COMPONENTS: Record<string, React.ComponentType> = {
  profile: ProfileSection,
  workspace: WorkspaceSection,
  ai: AIIntelligenceSection,
  audio: AudioProcessingSection,
  notifications: NotificationsSection,
  integrations: IntegrationsSection,
  exportPrefs: ExportSection,
  privacy: PrivacySection,
  storage: StorageSection,
  appearance: AppearanceSection,
  advanced: AdvancedSection,
};

function MobileAccordion() {
  const items = useMemo(
    () =>
      SETTINGS_NAV.map((nav) => ({
        id: nav.id,
        title: nav.label,
        subtitle: nav.description,
        content: (() => {
          const Comp = SECTION_COMPONENTS[nav.id];
          return Comp ? <Comp /> : null;
        })(),
      })),
    [],
  );
  return <Accordion items={items} defaultOpen={SETTINGS_NAV[0].id} />;
}

export function Settings() {
  const { isLoading, isError, refetch } = useSettingsBootstrap();
  const draft = useSettingsStore((s) => s.draft);
  const saved = useSettingsStore((s) => s.saved);
  const discard = useSettingsStore((s) => s.discard);
  const saveMutation = useSaveSettings();
  const contentRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string>(SETTINGS_NAV[0].id);
  const [navQuery, setNavQuery] = useState("");

  const isDirty = useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(saved),
    [draft, saved],
  );

  // Track which section is in view to highlight the nav rail.
  useEffect(() => {
    const sections = SETTINGS_NAV.map((n) =>
      document.querySelector<HTMLElement>(`[data-settings-section="${n.id}"]`),
    ).filter(Boolean) as HTMLElement[];
    if (sections.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top = visible[0]?.target as HTMLElement | undefined;
        if (top?.dataset.settingsSection) setActiveId(top.dataset.settingsSection);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [isLoading]);

  // ⌘S / Ctrl+S to save when dirty.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        if (!isDirty) return;
        e.preventDefault();
        saveMutation.mutate(draft);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDirty, draft, saveMutation]);

  const onSelect = (id: string) => {
    setActiveId(id);
    const el = document.querySelector<HTMLElement>(`[data-settings-section="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredNav = useMemo(() => {
    const q = navQuery.trim().toLowerCase();
    if (!q) return SETTINGS_NAV;
    return SETTINGS_NAV.filter(
      (n) =>
        n.label.toLowerCase().includes(q) ||
        n.description?.toLowerCase().includes(q),
    );
  }, [navQuery]);

  if (isLoading) {
    return (
      <div className="px-lg pt-lg pb-2xl max-w-6xl mx-auto space-y-md">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-lg pt-2xl text-center">
        <p className="font-geist text-on-surface text-body-lg">
          Couldn't load settings.
        </p>
        <button
          onClick={() => refetch()}
          className="mt-md font-mono text-label-md text-primary uppercase tracking-widest"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative">
        <div className="lg:hidden p-lg">
          <header className="space-y-1 mb-md">
            <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
              Settings
            </p>
            <h1 className="font-geist font-semibold text-on-surface text-headline-lg">
              Command Center
            </h1>
          </header>
          <MobileAccordion />
        </div>

        <div className="hidden lg:flex">
          <div className="w-[280px] shrink-0 sticky top-16 self-start max-h-[calc(100vh-4rem)]">
            <div className="px-md pt-lg pb-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant" />
                <input
                  type="text"
                  value={navQuery}
                  onChange={(e) => setNavQuery(e.target.value)}
                  placeholder="Jump to setting…"
                  className="w-full h-9 pl-9 pr-3 rounded-lg bg-surface-container-low border border-outline-variant font-geist text-body-md text-on-surface placeholder:text-outline focus-ring"
                />
              </div>
            </div>
            <SettingsNav
              activeId={activeId}
              onSelect={onSelect}
              items={filteredNav}
            />
          </div>

          <div
            ref={contentRef}
            className="flex-1 min-w-0 max-w-4xl mx-auto px-2xl pt-lg pb-[160px] space-y-2xl"
          >
            <header className="space-y-1">
              <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest">
                Settings
              </p>
              <h1 className="font-geist font-semibold text-on-surface text-headline-lg">
                Command Center
              </h1>
              <p className="font-geist text-body-md text-on-surface-variant max-w-2xl">
                Configure the AI Meeting Intelligence Platform from a single, opinionated surface.
                Changes apply across every meeting in this workspace.
              </p>
            </header>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2xl"
            >
              <ProfileSection />
              <WorkspaceSection />
              <AIIntelligenceSection />
              <AudioProcessingSection />
              <NotificationsSection />
              <IntegrationsSection />
              <ExportSection />
              <PrivacySection />
              <StorageSection />
              <AppearanceSection />
              <AdvancedSection />
            </motion.div>
          </div>
        </div>

        <SaveBar
          visible={isDirty}
          saving={saveMutation.isPending}
          onSave={() => saveMutation.mutate(draft)}
          onDiscard={discard}
        />

        {saveMutation.isPending && (
          <div className="fixed bottom-44 right-6 z-30 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-high text-on-surface-variant font-mono text-label-sm uppercase tracking-wider flex items-center gap-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            Syncing
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
