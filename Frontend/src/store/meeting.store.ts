import { create } from "zustand";

type VaultView = "grid" | "list";

interface MeetingUIState {
  vaultView: VaultView;
  setVaultView: (v: VaultView) => void;

  vaultQuery: string;
  setVaultQuery: (q: string) => void;

  activeIntelligenceTab: "summary" | "actions" | "analytics";
  setActiveIntelligenceTab: (t: "summary" | "actions" | "analytics") => void;

  transcriptQuery: string;
  setTranscriptQuery: (q: string) => void;
}

export const useMeetingUIStore = create<MeetingUIState>((set) => ({
  vaultView: "grid",
  setVaultView: (vaultView) => set({ vaultView }),
  vaultQuery: "",
  setVaultQuery: (vaultQuery) => set({ vaultQuery }),
  activeIntelligenceTab: "summary",
  setActiveIntelligenceTab: (activeIntelligenceTab) =>
    set({ activeIntelligenceTab }),
  transcriptQuery: "",
  setTranscriptQuery: (transcriptQuery) => set({ transcriptQuery }),
}));
