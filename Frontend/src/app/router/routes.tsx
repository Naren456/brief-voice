import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Home } from "@/pages/Home";
import { Vault } from "@/pages/Vault";
import { MeetingDetail } from "@/pages/MeetingDetail";
import { Analytics } from "@/pages/Analytics";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";
import { Landing } from "@/pages/Landing";

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  in: { opacity: 1, y: 0 },
};

// Enter-only animation. We intentionally avoid AnimatePresence/exit animations
// here: under React StrictMode the exit-complete callback can be dropped, which
// leaves the previous page stuck in the DOM at opacity 0 (a blank screen until a
// reload). Remounting via `key={pathname}` replays the enter animation cleanly.
function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      variants={pageVariants}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

export function AppRoutes() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  // Reset scroll on navigation — the page scrolls on the window, so a short
  // page reached from a scrolled-down long one would otherwise open mid-page.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (isLanding) {
    return (
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Landing /></Page>} />
      </Routes>
    );
  }

  return (
    <AppShell>
      <Routes location={location} key={location.pathname}>
        <Route path="/dashboard" element={<Page><Home /></Page>} />
        <Route path="/vault" element={<Page><Vault /></Page>} />
        <Route path="/meeting/:id" element={<Page><MeetingDetail /></Page>} />
        <Route path="/analytics" element={<Page><Analytics /></Page>} />
        <Route path="/settings" element={<Page><Settings /></Page>} />
        <Route path="*" element={<Page><NotFound /></Page>} />
      </Routes>
    </AppShell>
  );
}
