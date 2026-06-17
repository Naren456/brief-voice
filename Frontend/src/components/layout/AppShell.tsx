import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { AudioDock } from "./AudioDock";
import { useLocation } from "react-router-dom";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const location = useLocation();
  const isMeetingDetail = location.pathname.startsWith("/meeting/");

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        <Topbar />
        <main
          className={
            "flex-1 relative " +
            (isMeetingDetail ? "overflow-hidden" : "overflow-x-hidden")
          }
        >
          <div className="bg-grid-fade absolute inset-0 pointer-events-none -z-0 opacity-60" />
          <div className="relative z-[1] h-full pb-24">{children}</div>
        </main>
      </div>
      <AudioDock />
    </div>
  );
}
