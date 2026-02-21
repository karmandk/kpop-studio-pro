import { useState } from "react";
import { Disc3, Loader2, ArrowLeft } from "lucide-react";

type View = "signIn" | "signUp" | "forgot";

interface LoginPageProps {
  onSignIn: (email: string, password: string) => Promise<{ error: string | null }>;
  onSignUp: (email: string, password: string) => Promise<{ error: string | null }>;
  onResetPassword: (email: string) => Promise<{ error: string | null }>;
}

export default function LoginPage({ onSignIn, onSignUp, onResetPassword }: LoginPageProps) {
  const [view, setView] = useState<View>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function switchView(v: View) {
    setView(v);
    setError(null);
    setSuccess(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (view === "forgot") {
      const result = await onResetPassword(email);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Password reset link sent! Check your email.");
      }
      return;
    }

    const result = view === "signUp"
      ? await onSignUp(email, password)
      : await onSignIn(email, password);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (view === "signUp") {
      setSuccess("Account created! Check your email to confirm, then sign in.");
    }
  }

  const titles: Record<View, string> = {
    signIn: "Sign in",
    signUp: "Create account",
    forgot: "Reset password",
  };

  const buttonLabels: Record<View, string> = {
    signIn: "Sign In",
    signUp: "Create Account",
    forgot: "Send Reset Link",
  };

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
          <p className="text-gray-500 text-sm">
            Tier designer + discovery hub for K-pop groups
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/60 border border-white/10 rounded-2xl p-8 space-y-5"
        >
          <h2 className="text-center text-sm font-semibold text-gray-400 uppercase tracking-wider">
            {titles[view]}
          </h2>

          <div className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-600"
            />
            {view !== "forgot" && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={6}
                className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 placeholder-gray-600"
              />
            )}
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          {success && (
            <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm bg-purple-500 text-white hover:bg-purple-400 transition-all disabled:opacity-50"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {buttonLabels[view]}
          </button>

          {/* Footer links */}
          {view === "signIn" && (
            <div className="space-y-2 text-center text-xs text-gray-500">
              <p>
                <button
                  type="button"
                  onClick={() => switchView("forgot")}
                  className="text-purple-400 hover:underline font-semibold"
                >
                  Forgot password?
                </button>
              </p>
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchView("signUp")}
                  className="text-purple-400 hover:underline font-semibold"
                >
                  Sign up
                </button>
              </p>
            </div>
          )}

          {view === "signUp" && (
            <p className="text-center text-xs text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("signIn")}
                className="text-purple-400 hover:underline font-semibold"
              >
                Sign in
              </button>
            </p>
          )}

          {view === "forgot" && (
            <p className="text-center">
              <button
                type="button"
                onClick={() => switchView("signIn")}
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:underline font-semibold"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to sign in
              </button>
            </p>
          )}
        </form>

        <p className="text-center text-xs text-gray-700">
          Your tier lists and cached data are stored per-account.
        </p>
      </div>
    </div>
  );
}
