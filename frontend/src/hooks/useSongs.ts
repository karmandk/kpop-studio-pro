import { useState, useCallback, useEffect } from "react";
import type { Song, AppSettings } from "../lib/types";
import { fetchSongs } from "../lib/api";

const STORAGE_KEY = "kpop_songs_cache";

function loadFromStorage(): { songs: Song[]; year: string } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.songs) && parsed.songs.length > 0) return parsed;
  } catch { /* corrupted storage */ }
  return null;
}

function saveToStorage(songs: Song[], year: string) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ songs, year, savedAt: Date.now() }));
  } catch { /* quota exceeded */ }
}

export function useSongs() {
  const [songs, setSongs] = useState<Song[]>(() => {
    const cached = loadFromStorage();
    return cached?.songs ?? [];
  });
  const [cachedYear, setCachedYear] = useState<string>(() => {
    const cached = loadFromStorage();
    return cached?.year ?? "";
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");

  useEffect(() => {
    if (songs.length > 0 && cachedYear) {
      saveToStorage(songs, cachedYear);
    }
  }, [songs, cachedYear]);

  const loadSongs = useCallback(
    async (groups: string[], year: string, tierLookup: Record<string, string>) => {
      setLoading(true);
      setError(null);
      setProgress("Scanning artist discographies...");
      try {
        const raw = await fetchSongs(groups, year);
        const enriched = raw.map((s) => ({
          ...s,
          tier: tierLookup[s.group] || "C",
        }));
        setSongs(enriched);
        setCachedYear(year);
        setProgress("");
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to fetch songs");
        setProgress("");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearSongs = useCallback(() => {
    setSongs([]);
    setCachedYear("");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const sortSongs = useCallback(
    (songList: Song[], sortBy: AppSettings["sortBy"], tierOrder: string[]): Song[] => {
      const sorted = [...songList];
      switch (sortBy) {
        case "views":
          sorted.sort((a, b) => parseInt(b.views || "0") - parseInt(a.views || "0"));
          break;
        case "alpha":
          sorted.sort((a, b) => a.group.localeCompare(b.group) || a.title.localeCompare(b.title));
          break;
        case "tier":
        default:
          sorted.sort((a, b) => {
            const ta = tierOrder.indexOf(a.tier || "C");
            const tb = tierOrder.indexOf(b.tier || "C");
            if (ta !== tb) return ta - tb;
            return a.group.localeCompare(b.group);
          });
      }
      return sorted;
    },
    [],
  );

  const updateSongAnalysis = useCallback((videoId: string, analysis: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.video_id === videoId ? { ...s, analysis } : s)),
    );
  }, []);

  return { songs, cachedYear, loading, error, progress, loadSongs, clearSongs, sortSongs, updateSongAnalysis };
}
