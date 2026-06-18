import { Bell, Share2, FileDown, Loader2, Menu } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { api } from "@/services/api";
import { MobileSidebar } from "./MobileSidebar";

const ROUTE_TITLES: Record<string, { title: string; subtitle?: string }> = {
  "/dashboard": {
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
  const [exporting, setExporting] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Extract meeting ID from path if we're on a meeting detail page
  const meetingMatch = location.pathname.match(/^\/meeting\/(.+)$/);
  const meetingId = meetingMatch?.[1] ?? null;

  const meta =
    ROUTE_TITLES[location.pathname] ??
    (location.pathname.startsWith("/meeting/")
      ? { title: "Meeting Workspace", subtitle: "Transcript • Intelligence • Analytics" }
      : { title: "BriefVoice", subtitle: undefined });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("/vault");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const handleExport = async () => {
    if (!meetingId || exporting) return;
    setExporting(true);
    try {
      const response = await api.get(`/meetings/${meetingId}/report`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `meeting-${meetingId}-report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("[export] PDF generation failed", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <MobileSidebar open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <header className="sticky top-0 z-30 h-16 bg-surface/85 backdrop-blur-md border-b border-outline-variant flex items-center justify-between px-lg gap-lg">
        <div className="flex items-center gap-md min-w-0">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        <div className="flex flex-col min-w-0">
          <h2 className="font-geist font-semibold text-on-surface text-[15px] leading-tight truncate">
            {meta.title}
          </h2>
          {meta.subtitle && (
            <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider truncate">
              {meta.subtitle}
            </p>
          )}
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
        {meetingId && (
          <Button
            variant="primary"
            size="md"
            onClick={handleExport}
            disabled={exporting}
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            {exporting ? "Generating…" : "Export Brief"}
          </Button>
        )}
      </div>
    </header>
    </>
  );
}
