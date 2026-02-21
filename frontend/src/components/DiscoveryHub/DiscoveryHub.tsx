import { useState, useMemo } from "react";
import { Flame, Loader2, Music, AlertCircle, Trash2, Search, X } from "lucide-react";
import type { AppSettings, Song } from "../../lib/types";
import { TIER_ORDER } from "../../lib/types";
import { useTierState } from "../../hooks/useTierState";
import { useSongs } from "../../hooks/useSongs";
import { useLlm } from "../../hooks/useLlm";
import SongRow from "./SongRow";
import VideoModal from "./VideoModal";

interface DiscoveryHubProps {
  settings: AppSettings;
}

export default function DiscoveryHub({ settings }: DiscoveryHubProps) {
  const { containers, allGroups } = useTierState();
  const { songs, cachedYear, loading, error, loadSongs, clearSongs, sortSongs, updateSongAnalysis } = useSongs();
  const { analyze, analyzingId } = useLlm(settings);

  const [videoModal, setVideoModal] = useState<{
    videoId: string;
    title: string;
  } | null>(null);
  const [groupFilter, setGroupFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const tierLookup = useMemo(() => {
    const map: Record<string, string> = {};
    containers.forEach((c) => c.items.forEach((item) => (map[item] = c.header)));
    return map;
  }, [containers]);

  const uniqueGroups = useMemo(
    () => [...new Set(songs.map((s) => s.group))].sort(),
    [songs],
  );

  const filtered = useMemo(() => {
    if (!groupFilter) return songs;
    return songs.filter((s) => s.group === groupFilter);
  }, [songs, groupFilter]);

  const sorted = useMemo(
    () => sortSongs(filtered, settings.sortBy, [...TIER_ORDER]),
    [filtered, settings.sortBy, sortSongs],
  );

  const filterSuggestions = useMemo(() => {
    if (!filterOpen) return [];
    return uniqueGroups;
  }, [uniqueGroups, filterOpen]);

  function handleBake() {
    loadSongs(allGroups, settings.year, tierLookup);
  }

  async function handleAnalyze(song: Song) {
    const analysis = await analyze(song.title, song.group, song.video_id);
    if (analysis) {
      updateSongAnalysis(song.video_id, analysis);
    }
  }

  return (
    <div className="space-y-4">
      {/* Bake controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={handleBake}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Flame className="w-4 h-4" />
          )}
          {loading ? "Scanning..." : "BAKE DATA"}
        </button>
        {songs.length > 0 && (
          <button
            onClick={clearSongs}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-400 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Results
          </button>
        )}
        <span className="text-sm text-gray-500">
          {songs.length > 0 && cachedYear
            ? `${songs.length} cached tracks for ${cachedYear}`
            : `Scan all ${allGroups.length} groups for ${settings.year} releases`}
        </span>
      </div>

      {/* Group filter */}
      {songs.length > 0 && (
        <div className="relative w-72">
          <div className="flex items-center bg-gray-800 border border-white/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50">
            <Search className="w-4 h-4 text-gray-500 ml-3 shrink-0" />
            <input
              type="text"
              value={groupFilter}
              onChange={(e) => {
                setGroupFilter(e.target.value);
                setFilterOpen(true);
              }}
              onFocus={() => setFilterOpen(true)}
              onBlur={() => setTimeout(() => setFilterOpen(false), 150)}
              placeholder="Filter by group..."
              className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none"
            />
            {groupFilter && (
              <button
                onClick={() => { setGroupFilter(""); setFilterOpen(false); }}
                className="p-1.5 mr-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {filterOpen && filterSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-gray-800 border border-white/10 rounded-lg shadow-xl">
              {filterSuggestions
                .filter((g) => g.toLowerCase().includes(groupFilter.toLowerCase()))
                .map((g) => (
                  <button
                    key={g}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setGroupFilter(g);
                      setFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors ${
                      g === groupFilter ? "text-purple-400 font-semibold bg-purple-500/10" : "text-gray-300"
                    }`}
                  >
                    {g}
                  </button>
                ))}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 bg-red-900/20 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Results */}
      {sorted.length > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-gray-500 px-4 pb-2">
            <Music className="w-3.5 h-3.5" />
            <span>
              {sorted.length} {groupFilter ? "filtered" : "verified"} tracks
              {groupFilter ? ` for ${groupFilter}` : " found"}
              {groupFilter && ` (${songs.length} total)`}
            </span>
          </div>
          {sorted.map((song) => (
            <SongRow
              key={song.video_id}
              song={song}
              onWatch={(vid, title) => setVideoModal({ videoId: vid, title })}
              onAnalyze={handleAnalyze}
              analyzing={analyzingId === song.video_id}
            />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <Music className="w-12 h-12 mb-4 opacity-30" />
            <p className="text-lg font-semibold">No data yet</p>
            <p className="text-sm mt-1">
              Click <strong>BAKE DATA</strong> to scan official discographies for{" "}
              {settings.year}.
            </p>
          </div>
        )
      )}

      {/* Video modal */}
      {videoModal && (
        <VideoModal
          videoId={videoModal.videoId}
          title={videoModal.title}
          onClose={() => setVideoModal(null)}
        />
      )}
    </div>
  );
}
