export interface TierContainer {
  header: string;
  items: string[];
  color?: string;
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

export const DEFAULT_TIER_COLORS: Record<string, string> = {
  PEAK: "#FFD700",
  SSS: "#9D50BB",
  S: "#ff4b4b",
  A: "#00C9FF",
  B: "#92FE9D",
  C: "#bdc3c7",
};

export const PRESET_COLORS = [
  "#FFD700", "#FF6B6B", "#9D50BB", "#00C9FF", "#92FE9D",
  "#FF8C00", "#FF69B4", "#6366F1", "#14B8A6", "#F59E0B",
  "#EF4444", "#8B5CF6", "#06B6D4", "#10B981", "#bdc3c7",
];

export function getTierColor(header: string, customColor?: string): string {
  return customColor || DEFAULT_TIER_COLORS[header] || "#888888";
}

export const TIER_ORDER = ["PEAK", "SSS", "S", "A", "B", "C"] as const;
export type TierName = (typeof TIER_ORDER)[number];

export const TIER_META: Record<TierName, { label: string; color: string; gradient: string }> = {
  PEAK: { label: "PEAK", color: "#FFD700", gradient: "from-yellow-500/15 to-transparent" },
  SSS: { label: "SSS", color: "#9D50BB", gradient: "from-purple-500/15 to-transparent" },
  S: { label: "S", color: "#ff4b4b", gradient: "from-red-500/15 to-transparent" },
  A: { label: "A", color: "#00C9FF", gradient: "from-cyan-500/15 to-transparent" },
  B: { label: "B", color: "#92FE9D", gradient: "from-green-400/15 to-transparent" },
  C: { label: "C", color: "#bdc3c7", gradient: "from-gray-400/15 to-transparent" },
};
