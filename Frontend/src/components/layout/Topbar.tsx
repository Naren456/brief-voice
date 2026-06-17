import { Bell, Search, Share2, FileDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Kbd } from "@/components/ui/Kbd";
import { useMeetingUIStore } from "@/store/meeting.store";

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/": {
    title: "Ingestion Gateway",
    subtitle: "Upload meetings for AI synthesis",
  },
  "/vault": { title: "Vault Archive", subtitle: "Semantic search across intelligence" },
  "/analytics": {
    title: "Global Intelligence Analytics",
    subtitle: "Real-time performance metrics",
  },
  "/settings": {
    title: "Settings",
    subtitle: "Command center for the platform",
  },
};

export function Topbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const setVaultQuery = useMeetingUIStore((s) => s.setVaultQuery);

  const meta =
    ROUTE_TITLES[location.pathname] ??
    (location.pathname.startsWith("/meeting/")
      ? { title: "Meeting Workspace", subtitle: "Transcript • Intelligence • Analytics" }
      : { title: "BriefVoice", subtitle: undefined });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-surface/85 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-lg gap-lg">
      <div className="flex items-center gap-lg min-w-0">
        <div className="hidden lg:flex flex-col min-w-0">
          <h2 className="font-geist font-semibold text-on-surface text-[15px] leading-tight truncate">
            {meta.title}
          </h2>
          {meta.subtitle && (
            <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider truncate">
              {meta.subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-sm h-9 pl-3 pr-2 rounded-lg border border-outline-variant bg-surface-container-low max-w-[420px] flex-1 lg:flex-none lg:w-[360px]">
          <Search className="w-4 h-4 text-on-surface-variant" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search meetings, decisions, owners…"
            onChange={(e) => setVaultQuery(e.target.value)}
            onFocus={() => {
              if (location.pathname !== "/vault") navigate("/vault");
            }}
            className="bg-transparent border-none outline-none text-body-md text-on-surface placeholder:text-outline flex-1 min-w-0"
          />
          <Kbd>⌘K</Kbd>
        </div>
      </div>

      <div className="flex items-center gap-md">
        <div className="hidden md:flex items-center gap-xs text-on-surface-variant">
          <button className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-tertiary rounded-full" />
          </button>
          <button className="w-9 h-9 inline-flex items-center justify-center rounded-lg hover:bg-surface-container-high hover:text-on-surface transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
        <Button variant="primary" size="md">
          <FileDown className="w-4 h-4" />
          Export Executive Brief
        </Button>
      </div>
    </header>
  );
}
