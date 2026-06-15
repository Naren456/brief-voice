import {
  AudioLines,
  Bell,
  Boxes,
  Briefcase,
  Cog,
  FileDown,
  HardDrive,
  Palette,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export interface SettingsNavItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof UserRound;
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  { id: "profile", label: "Profile", description: "Identity and language", icon: UserRound },
  { id: "workspace", label: "Workspace", description: "Org defaults & retention", icon: Briefcase },
  { id: "ai", label: "AI Intelligence", description: "Summaries · actions · topics", icon: Sparkles },
  { id: "audio", label: "Audio Processing", description: "Quality · diarization", icon: AudioLines },
  { id: "notifications", label: "Notifications", description: "Channels & triggers", icon: Bell },
  { id: "integrations", label: "Integrations", description: "Calendar, comms, code", icon: Boxes },
  { id: "exportPrefs", label: "Export & Reports", description: "Formats & templates", icon: FileDown },
  { id: "privacy", label: "Privacy & Security", description: "Storage & access", icon: ShieldCheck },
  { id: "storage", label: "Storage", description: "Plan usage & quotas", icon: HardDrive },
  { id: "appearance", label: "Appearance", description: "Theme · density · motion", icon: Palette },
  { id: "advanced", label: "Advanced", description: "Diagnostics & runtime", icon: Cog },
];

interface SettingsNavProps {
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
  items?: SettingsNavItem[];
}

export function SettingsNav({ activeId, onSelect, className, items }: SettingsNavProps) {
  const list = items ?? SETTINGS_NAV;
  return (
    <nav
      className={cn(
        "w-[280px] shrink-0 flex flex-col gap-1 sticky top-16 self-start max-h-[calc(100vh-4rem)] overflow-y-auto pr-md py-lg pl-md border-r border-outline-variant",
        className,
      )}
    >
      <div className="px-2 mb-md">
        <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
          Settings
        </p>
        <h2 className="font-geist font-semibold text-on-surface text-[16px]">
          Command Center
        </h2>
      </div>
      {list.length === 0 && (
        <p className="px-3 font-geist text-body-md text-on-surface-variant">
          No matches.
        </p>
      )}
      {list.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "relative w-full text-left flex items-start gap-md py-2 px-3 rounded-lg transition-colors group",
              isActive
                ? "bg-surface-container-high/70 text-on-surface"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="settings-nav-active"
                className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-primary"
                transition={{ type: "spring", stiffness: 360, damping: 30 }}
              />
            )}
            <item.icon
              className={cn(
                "w-4 h-4 mt-0.5 shrink-0",
                isActive ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface",
              )}
            />
            <span className="min-w-0">
              <span className="block font-geist text-body-md font-medium leading-tight">
                {item.label}
              </span>
              {item.description && (
                <span className="block font-mono text-label-sm text-on-surface-variant uppercase tracking-wider mt-0.5">
                  {item.description}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
