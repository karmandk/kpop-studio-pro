import { Play, Sparkles, Loader2 } from "lucide-react";
import type { Song } from "../../lib/types";
import { getTierColor } from "../../lib/types";
import AiPanel from "./AiPanel";

interface SongRowProps {
  song: Song;
  onWatch: (videoId: string, title: string) => void;
  onAnalyze: (song: Song) => void;
  analyzing: boolean;
  tierColorMap?: Record<string, string>;
}

function formatViews(v: string): string {
  const n = parseInt(v || "0");
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n === 0 ? "N/A" : n.toLocaleString();
}

export default function SongRow({ song, onWatch, onAnalyze, analyzing, tierColorMap }: SongRowProps) {
  const tierColor = tierColorMap?.[song.tier || ""] || getTierColor(song.tier || "");

  return (
    <div className="group">
      <div className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 transition-colors">
        <span
          className="text-[10px] font-black w-10 text-center py-0.5 rounded-md shrink-0"
          style={{ backgroundColor: `${tierColor}20`, color: tierColor }}
        >
          {song.tier || "?"}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm truncate">{song.group}</span>
            <span className="text-gray-500">—</span>
            <span className="text-sm text-gray-300 truncate">{song.title}</span>
          </div>
          <span className="text-xs text-gray-600">{song.album}</span>
        </div>

        <span className="text-xs font-mono font-bold text-red-400 bg-red-400/10 border border-red-400/20 px-2.5 py-1 rounded-full shrink-0">
          {formatViews(song.views)} views
        </span>

        <span className="text-xs font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-2.5 py-1 rounded-full shrink-0">
          {song.year}
        </span>

        <button
          onClick={() => onWatch(song.video_id, `${song.group} — ${song.title}`)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shrink-0"
        >
          <Play className="w-3 h-3" />
          Watch
        </button>

        <button
          onClick={() => onAnalyze(song)}
          disabled={analyzing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500/30 transition-all shrink-0 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
          AI
        </button>
      </div>
      {song.analysis && <AiPanel analysis={song.analysis} />}
    </div>
  );
}
