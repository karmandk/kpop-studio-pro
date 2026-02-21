import { useState } from "react";
import { Loader2, X, Link } from "lucide-react";
import type { Song } from "../../lib/types";

interface PlaylistImportProps {
  onImported: (songs: Song[]) => void;
  onClose: () => void;
}

export default function PlaylistImport({ onImported, onClose }: PlaylistImportProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/playlist/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(body || `HTTP ${res.status}`);
      }
      const data: Song[] = await res.json();
      if (data.length === 0) throw new Error("No tracks found in this playlist");
      onImported(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-900/60 border border-white/10 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Import from YouTube Music Playlist</p>
        <button onClick={onClose} className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center flex-1 bg-gray-800 border border-white/10 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50">
          <Link className="w-4 h-4 text-gray-500 ml-3 shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleImport()}
            placeholder="https://music.youtube.com/playlist?list=..."
            className="w-full bg-transparent px-2 py-2 text-sm focus:outline-none placeholder-gray-600"
          />
        </div>
        <button
          onClick={handleImport}
          disabled={loading || !url.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-purple-500 text-white hover:bg-purple-400 transition-all disabled:opacity-50"
        >
          {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Import
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-[10px] text-gray-600">
        Paste a YouTube Music playlist URL. Song data (views, album) will be fetched automatically.
      </p>
    </div>
  );
}
