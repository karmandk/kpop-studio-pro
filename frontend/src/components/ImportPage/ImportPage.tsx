import { useState } from "react";
import { Loader2, Link, ListPlus, Music, CheckCircle2 } from "lucide-react";
import type { Song } from "../../lib/types";

interface ImportPageProps {
  onImported: (songs: Song[]) => void;
  importedCount: number;
}

export default function ImportPage({ onImported, importedCount }: ImportPageProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastImportCount, setLastImportCount] = useState(0);

  async function handleImport() {
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setLastImportCount(0);
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
      setLastImportCount(data.length);
      setUrl("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <ListPlus className="w-12 h-12 text-purple-400 mx-auto opacity-60" />
        <h2 className="text-2xl font-black">Import Playlist</h2>
        <p className="text-gray-500 text-sm">
          Paste a YouTube Music playlist URL to import all tracks with metadata and view counts.
        </p>
      </div>

      {/* Import form */}
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-6 space-y-4">
        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          YouTube Music Playlist URL
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center flex-1 bg-gray-800 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500/50">
            <Link className="w-4 h-4 text-gray-500 ml-4 shrink-0" />
            <input
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(null); setLastImportCount(0); }}
              onKeyDown={(e) => e.key === "Enter" && handleImport()}
              placeholder="https://music.youtube.com/playlist?list=..."
              className="w-full bg-transparent px-3 py-3 text-sm focus:outline-none placeholder-gray-600"
            />
          </div>
          <button
            onClick={handleImport}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-purple-500 text-white hover:bg-purple-400 transition-all disabled:opacity-50 shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListPlus className="w-4 h-4" />}
            {loading ? "Importing..." : "Import"}
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {lastImportCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Successfully imported {lastImportCount} tracks! View them in the Discovery Hub.
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-900/40 border border-white/5 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-bold text-gray-400">How it works</h3>
        <ol className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
          <li>Copy a playlist URL from YouTube Music (or regular YouTube)</li>
          <li>Paste it above and click Import</li>
          <li>Song metadata (artist, album, views) is fetched automatically</li>
          <li>Imported tracks appear in the <strong className="text-gray-400">Discovery Hub</strong> alongside any baked data</li>
        </ol>
        <p className="text-[10px] text-gray-600 pt-1">
          Supported URL formats: <code className="text-gray-500">music.youtube.com/playlist?list=...</code> or <code className="text-gray-500">youtube.com/playlist?list=...</code>
        </p>
      </div>

      {/* Stats */}
      {importedCount > 0 && (
        <div className="flex items-center gap-2 justify-center text-xs text-gray-500">
          <Music className="w-3.5 h-3.5" />
          {importedCount} total tracks in Discovery Hub
        </div>
      )}
    </div>
  );
}
