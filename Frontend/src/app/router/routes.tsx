import { Route, Routes, useLocation, Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell } from "@/components/layout/AppShell";
import { Home } from "@/pages/Home";
import { Vault } from "@/pages/Vault";
import { MeetingDetail } from "@/pages/MeetingDetail";
import { Analytics } from "@/pages/Analytics";
import { Settings } from "@/pages/Settings";
import { NotFound } from "@/pages/NotFound";

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -4 },
};

function Page({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
}

import { Landing } from "@/pages/Landing";

function AppLayout() {
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}

export function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Landing /></Page>} />
        
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Page><Home /></Page>} />
          <Route path="/vault" element={<Page><Vault /></Page>} />
          <Route path="/meeting/:id" element={<Page><MeetingDetail /></Page>} />
          <Route path="/analytics" element={<Page><Analytics /></Page>} />
          <Route path="/settings" element={<Page><Settings /></Page>} />
          <Route path="*" element={<Page><NotFound /></Page>} />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
