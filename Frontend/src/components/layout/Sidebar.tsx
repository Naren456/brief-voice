import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  FolderArchive,
  BarChart3,
  Settings,
  Upload,
  LifeBuoy,
  AudioLines,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import { useUploadStore } from "@/store/upload.store";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home, end: true },
  { to: "/vault", label: "Vault", icon: FolderArchive },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function Sidebar() {
  const navigate = useNavigate();
  const resetUpload = useUploadStore((s) => s.reset);

  const startNewUpload = () => {
    resetUpload();
    navigate("/dashboard");
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface border-r border-outline-variant z-40 hidden md:flex flex-col py-md">
      <div className="px-lg mb-xl flex items-center gap-sm">
        <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
          <AudioLines className="w-[18px] h-[18px] text-primary" strokeWidth={2.2} />
        </div>
        <div>
          <h1 className="font-geist font-semibold text-on-surface text-[15px] leading-tight">
            BriefVoice
          </h1>
          <p className="font-mono text-label-sm text-on-surface-variant uppercase tracking-wider">
            AI Intelligence
          </p>
        </div>
      </div>

      <nav className="flex-1 px-sm space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={"end" in item ? item.end : undefined}
            className={({ isActive }) =>
              cn(
                "group relative flex items-center gap-md py-2.5 px-3 rounded-lg transition-colors",
                "font-mono text-label-md tracking-wide",
                isActive
                  ? "text-primary bg-surface-container-high/60"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <item.icon className="w-4 h-4" strokeWidth={1.75} />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-sm pt-md border-t border-outline-variant space-y-sm">
        <button
          onClick={startNewUpload}
          className="w-full flex items-center justify-center gap-sm py-2.5 rounded-lg bg-primary-container/90 hover:bg-primary-container text-on-primary-container font-mono text-label-md tracking-wide transition-colors active:scale-[0.98]"
        >
          <Upload className="w-4 h-4" strokeWidth={2} />
          Upload Meeting
        </button>
        <button className="w-full flex items-center gap-md py-2 px-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/40 rounded-lg font-mono text-label-md tracking-wide transition-colors">
          <LifeBuoy className="w-4 h-4" strokeWidth={1.75} />
          Support
        </button>
      </div>
    </aside>
  );
}
