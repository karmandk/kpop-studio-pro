import { Settings, Calendar, Brain, ArrowUpDown, Key, LogOut } from "lucide-react";
import type { AppSettings } from "../../lib/types";
import type { User } from "@supabase/supabase-js";

interface SidebarProps {
  settings: AppSettings;
  onSettingsChange: (s: AppSettings) => void;
  user?: User | null;
  onSignOut?: () => void;
}

export default function Sidebar({ settings, onSettingsChange, user, onSignOut }: SidebarProps) {
  function update(patch: Partial<AppSettings>) {
    onSettingsChange({ ...settings, ...patch });
  }

  return (
    <aside className="w-64 shrink-0 bg-gray-900/50 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <h1 className="text-lg font-black tracking-tight">
          <span className="text-purple-400">K-Pop</span> Studio Pro
        </h1>
        <p className="text-[10px] text-gray-600 mt-0.5 tracking-wider uppercase">
          Tier Designer + Discovery Hub
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Settings header */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <Settings className="w-3.5 h-3.5" />
          Settings
        </div>

        {/* Year */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            Analysis Year
          </label>
          <input
            type="text"
            value={settings.year}
            onChange={(e) => update({ year: e.target.value })}
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
            placeholder="2026"
          />
        </div>

        {/* LLM Backend */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <Brain className="w-3.5 h-3.5" />
            AI Backend
          </label>
          <select
            value={settings.llmBackend}
            onChange={(e) =>
              update({ llmBackend: e.target.value as AppSettings["llmBackend"] })
            }
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="auto">Auto (Ollama → Groq)</option>
            <option value="ollama">Ollama (Local Only)</option>
            <option value="groq">Groq Cloud</option>
          </select>
        </div>

        {/* Groq API Key */}
        {(settings.llmBackend === "groq" || settings.llmBackend === "auto") && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Key className="w-3.5 h-3.5" />
              Groq API Key
            </label>
            <input
              type="password"
              value={settings.groqApiKey}
              onChange={(e) => update({ groqApiKey: e.target.value })}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              placeholder="gsk_..."
            />
            <p className="text-[10px] text-gray-600">
              Free at{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline"
              >
                console.groq.com
              </a>
            </p>
          </div>
        )}

        {/* Sort */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-400">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort Songs By
          </label>
          <select
            value={settings.sortBy}
            onChange={(e) =>
              update({ sortBy: e.target.value as AppSettings["sortBy"] })
            }
            className="w-full bg-gray-800 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            <option value="tier">Tier Rank</option>
            <option value="views">Views (High → Low)</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* User / Footer */}
      <div className="px-5 py-3 border-t border-white/5 space-y-3">
        {user && (
          <div className="flex items-center gap-2">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt=""
                className="w-7 h-7 rounded-full border border-white/10"
              />
            )}
            <span className="text-xs text-gray-400 truncate flex-1">
              {user.user_metadata?.user_name || user.email || "User"}
            </span>
            <button
              onClick={onSignOut}
              className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        <p className="text-[10px] text-gray-700 text-center">
          Built with React + FastAPI + dnd-kit
        </p>
      </div>
    </aside>
  );
}
