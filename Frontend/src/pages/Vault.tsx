import { useState } from "react";
import { motion } from "framer-motion";
import { Grid2x2, List, FolderArchive } from "lucide-react";
import { SearchBar } from "@/components/vault/SearchBar";
import { QuickFilters } from "@/components/vault/QuickFilters";
import { MeetingCard } from "@/components/meetings/MeetingCard";
import { ResultCard } from "@/components/vault/ResultCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMeetings } from "@/hooks/useMeetings";
import { useSearch } from "@/hooks/useSearch";
import { useMeetingUIStore } from "@/store/meeting.store";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 6;

export function Vault() {
  const { vaultView, setVaultView, vaultQuery, setVaultQuery } = useMeetingUIStore();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [visible, setVisible] = useState(PAGE_SIZE);

  const effectiveQuery = vaultQuery || activeFilter || "";
  const isSearching = effectiveQuery.trim().length > 0;

  const meetingsQuery = useMeetings();
  const searchQuery = useSearch(effectiveQuery);

  const meetings = meetingsQuery.data ?? [];
  const results = searchQuery.data ?? [];

  const loading = isSearching ? searchQuery.isLoading : meetingsQuery.isLoading;

  return (
    <div className="relative">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-[1] overflow-hidden opacity-30">
        <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/15 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] bg-secondary/10 blur-[120px] rounded-full" />
      </div>

      {/* Search header */}
      <section className="border-b border-outline-variant bg-surface/80 backdrop-blur-md">
        <div className="px-2xl py-xl max-w-5xl mx-auto space-y-md">
          <SearchBar
            value={vaultQuery}
            onChange={(v) => {
              setVaultQuery(v);
              setActiveFilter(null);
              setVisible(PAGE_SIZE);
            }}
          />
          <QuickFilters
            active={activeFilter}
            onSelect={(label) => {
              setActiveFilter((prev) => (prev === label ? null : label));
              setVaultQuery("");
              setVisible(PAGE_SIZE);
            }}
          />
        </div>
      </section>

      {/* Results */}
      <section className="px-2xl py-xl">
        <header className="flex items-center justify-between mb-lg">
          <div className="flex items-baseline gap-sm">
            <h3 className="font-geist font-semibold text-headline-md text-on-surface">
              {isSearching ? "Search Intelligence" : "Recent Intelligence"}
            </h3>
            <span className="font-mono text-label-md text-on-surface-variant">
              ({isSearching ? results.length : meetings.length} results)
            </span>
          </div>
          <div className="flex items-center gap-xs p-0.5 rounded-lg border border-outline-variant bg-surface-container-low">
            <button
              onClick={() => setVaultView("grid")}
              className={cn(
                "w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors",
                vaultView === "grid"
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              aria-label="Grid view"
            >
              <Grid2x2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVaultView("list")}
              className={cn(
                "w-8 h-8 inline-flex items-center justify-center rounded-md transition-colors",
                vaultView === "list"
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface",
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </header>

        {loading ? (
          <div
            className={cn(
              "grid gap-lg",
              vaultView === "grid"
                ? "grid-cols-[repeat(auto-fill,minmax(360px,1fr))]"
                : "grid-cols-1",
            )}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : isSearching ? (
          results.length === 0 ? (
            <EmptyState
              icon={FolderArchive}
              title="No intelligence matched that query"
              description="Try a different phrasing, or broaden with a quick filter."
            />
          ) : (
            <motion.div
              layout
              className={cn(
                "grid gap-lg",
                vaultView === "grid"
                  ? "grid-cols-[repeat(auto-fill,minmax(360px,1fr))]"
                  : "grid-cols-1",
              )}
            >
              {results.slice(0, visible).map((r, i) => (
                <motion.div
                  key={r.meeting.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.25 }}
                >
                  <ResultCard result={r} view={vaultView} />
                </motion.div>
              ))}
            </motion.div>
          )
        ) : meetings.length === 0 ? (
          <EmptyState
            icon={FolderArchive}
            title="No meetings yet"
            description="Ingest your first recording from the home page."
          />
        ) : (
          <motion.div
            layout
            className={cn(
              "grid gap-lg",
              vaultView === "grid"
                ? "grid-cols-[repeat(auto-fill,minmax(360px,1fr))]"
                : "grid-cols-1",
            )}
          >
            {meetings.slice(0, visible).map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
              >
                <MeetingCard meeting={m} view={vaultView} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {visible < (isSearching ? results.length : meetings.length) && (
          <div className="flex justify-center mt-xl">
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface-variant hover:text-on-surface hover:border-outline font-mono text-label-md tracking-wide transition-colors"
            >
              Load more intelligence
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
