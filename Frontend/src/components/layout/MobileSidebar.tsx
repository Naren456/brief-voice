import { NavLink, useNavigate } from "react-router-dom";
import {
  Home,
  FolderArchive,
  BarChart3,
  Settings,
  Upload,
  LifeBuoy,
  AudioLines,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Home", icon: Home, end: true },
  { to: "/vault", label: "Vault", icon: FolderArchive },
  { to: "/analytics", label: "Insights", icon: BarChart3 },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed left-0 top-0 h-screen w-72 bg-surface border-r border-outline-variant z-50 flex flex-col py-md md:hidden"
          >
            {/* Header */}
            <div className="px-lg mb-xl flex items-center justify-between">
              <div className="flex items-center gap-sm">
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
              <button
                onClick={onClose}
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-sm space-y-1">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={"end" in item ? item.end : undefined}
                  onClick={onClose}
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
                          layoutId="mobile-sidebar-active"
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

            {/* Bottom actions */}
            <div className="px-sm pt-md border-t border-outline-variant space-y-sm">
              <button
                onClick={() => { navigate("/dashboard"); onClose(); }}
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
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
