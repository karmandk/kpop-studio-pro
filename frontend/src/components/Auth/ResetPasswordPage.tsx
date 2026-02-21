import { useState } from "react";
import { Disc3, Loader2 } from "lucide-react";

interface ResetPasswordPageProps {
  onUpdatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

export default function ResetPasswordPage({ onUpdatePassword }: ResetPasswordPageProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const result = await onUpdatePassword(password);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <Disc3 className="w-10 h-10 text-purple-400" />
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-purple-400">K-Pop</span>{" "}
              <span className="text-white">Studio Pro</span>
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/60 border border-white/10 rounded-2xl p-8 space-y-5"
        >
          <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
            Set new password
          </h2>

          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="New password"
              required
              minLength={6}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-600"
            />
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Confirm new password"
              required
              minLength={6}
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-600"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-purple-500 text-white hover:bg-purple-400 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}
