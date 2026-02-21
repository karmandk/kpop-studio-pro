export interface TierContainer {
  header: string;
  items: string[];
}

export interface Song {
  group: string;
  tier?: string;
  title: string;
  video_id: string;
  views: string;
  year: string;
  album: string;
  analysis?: string;
}

export interface AppSettings {
  year: string;
  llmBackend: "auto" | "ollama" | "groq";
  groqApiKey: string;
  sortBy: "tier" | "views" | "alpha";
}

export const TIER_ORDER = ["PEAK", "SSS", "S", "A", "B", "C"] as const;
export type TierName = (typeof TIER_ORDER)[number];

export const TIER_META: Record<TierName, { label: string; color: string; gradient: string }> = {
  PEAK: {
    label: "PEAK",
    color: "#FFD700",
    gradient: "from-yellow-500/15 to-transparent",
  },
  SSS: {
    label: "SSS",
    color: "#9D50BB",
    gradient: "from-purple-500/15 to-transparent",
  },
  S: {
    label: "S",
    color: "#ff4b4b",
    gradient: "from-red-500/15 to-transparent",
  },
  A: {
    label: "A",
    color: "#00C9FF",
    gradient: "from-cyan-500/15 to-transparent",
  },
  B: {
    label: "B",
    color: "#92FE9D",
    gradient: "from-green-400/15 to-transparent",
  },
  C: {
    label: "C",
    color: "#bdc3c7",
    gradient: "from-gray-400/15 to-transparent",
  },
};
