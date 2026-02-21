import { useState, useCallback, useEffect, useRef } from "react";
import type { Song, AppSettings } from "../lib/types";
import { fetchSongs } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const LS_KEY = "kpop_songs_cache";

function loadFromLocalStorage(): { songs: Song[]; year: string } | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.songs) && parsed.songs.length > 0) return parsed;
  } catch { /* corrupted */ }
  return null;
}

function saveToLocalStorage(songs: Song[], year: string) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify({ songs, year, savedAt: Date.now() }));
  } catch { /* quota exceeded */ }
}

async function loadFromSupabase(userId: string, year: string): Promise<Song[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_song_caches")
    .select("songs")
    .eq("user_id", userId)
    .eq("year", year)
    .single();
  if (error || !data) return null;
  return data.songs as Song[];
}

async function saveToSupabase(userId: string, year: string, songs: Song[]) {
  if (!supabase) return;
  await supabase.from("user_song_caches").upsert(
    { user_id: userId, year, songs, updated_at: new Date().toISOString() },
    { onConflict: "user_id,year" },
  );
}

export function useSongs(user?: User | null) {
  const [songs, setSongs] = useState<Song[]>([]);
  const [cachedYear, setCachedYear] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>("");
  const initDone = useRef(false);

  useEffect(() => {
    if (initDone.current) return;
    const ls = loadFromLocalStorage();
    if (ls) {
      setSongs(ls.songs);
      setCachedYear(ls.year);
    }
    initDone.current = true;
  }, []);

  useEffect(() => {
    if (!supabase || !user || !cachedYear) return;
    loadFromSupabase(user.id, cachedYear).then((data) => {
      if (data && data.length > 0) setSongs(data);
    });
  }, [user, cachedYear]);

  useEffect(() => {
    if (songs.length === 0 || !cachedYear) return;
    saveToLocalStorage(songs, cachedYear);
    if (supabase && user) {
      saveToSupabase(user.id, cachedYear, songs).catch(console.error);
    }
  }, [songs, cachedYear, user]);

  const loadSongs = useCallback(
    async (groups: string[], years: string[], tierLookup: Record<string, string>) => {
      setLoading(true);
      setError(null);
      setProgress("Scanning artist discographies...");
      try {
        const allResults: Song[] = [];
        const seenVids = new Set<string>();
        for (const year of years) {
          setProgress(`Scanning ${year}...`);
          const raw = await fetchSongs(groups, year);
          for (const s of raw) {
            if (!seenVids.has(s.video_id)) {
              seenVids.add(s.video_id);
              allResults.push({ ...s, tier: tierLookup[s.group] || "?" });
            }
          }
        }
        setSongs(allResults);
        setCachedYear(years.join(","));
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

  const addSongs = useCallback((newSongs: Song[]) => {
    setSongs((prev) => {
      const seenVids = new Set(prev.map((s) => s.video_id));
      const unique = newSongs.filter((s) => !seenVids.has(s.video_id));
      return [...prev, ...unique];
    });
  }, []);

  const clearSongs = useCallback(() => {
    setSongs([]);
    setCachedYear("");
    localStorage.removeItem(LS_KEY);
    if (supabase && user && cachedYear) {
      supabase.from("user_song_caches").delete().eq("user_id", user.id).eq("year", cachedYear).then(() => {});
    }
  }, [user, cachedYear]);

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
            const ta = tierOrder.indexOf(a.tier || "?");
            const tb = tierOrder.indexOf(b.tier || "?");
            if (ta !== tb) return (ta === -1 ? 999 : ta) - (tb === -1 ? 999 : tb);
            return a.group.localeCompare(b.group);
          });
      }
      return sorted;
    },
    [],
  );

  const updateSongAnalysis = useCallback((videoId: string, analysis: string) => {
    setSongs((prev) => prev.map((s) => (s.video_id === videoId ? { ...s, analysis } : s)));
  }, []);

  return { songs, cachedYear, loading, error, progress, loadSongs, clearSongs, sortSongs, updateSongAnalysis, addSongs };
}
