import { useState } from "react";
import Header, { type Tab } from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import TierBoard from "./components/TierBoard/TierBoard";
import DiscoveryHub from "./components/DiscoveryHub/DiscoveryHub";
import StatsPage from "./components/StatsPage/StatsPage";
import BattlePage from "./components/BattlePage/BattlePage";
import ImportPage from "./components/ImportPage/ImportPage";
import LoginPage from "./components/Auth/LoginPage";
import ResetPasswordPage from "./components/Auth/ResetPasswordPage";
import { useAuth } from "./hooks/useAuth";
import { useTierState } from "./hooks/useTierState";
import { useSongs } from "./hooks/useSongs";
import type { AppSettings } from "./lib/types";
import { Loader2 } from "lucide-react";

export default function App() {
  const {
    user, loading: authLoading, passwordRecovery, isConfigured,
    signIn, signUp, resetPassword, updatePassword, signOut,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("tiers");
  const [settings, setSettings] = useState<AppSettings>({
    year: "2026",
    llmBackend: "auto",
    groqApiKey: "",
    sortBy: "tier",
  });

  const { containers, allGroups, setContainers: applyTierList, resetToDefault } = useTierState(user);
  const { songs, addSongs } = useSongs(user);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
      </div>
    );
  }

  if (passwordRecovery) {
    return <ResetPasswordPage onUpdatePassword={updatePassword} />;
  }

  if (isConfigured && !user) {
    return <LoginPage onSignIn={signIn} onSignUp={signUp} onResetPassword={resetPassword} />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar settings={settings} onSettingsChange={setSettings} user={user} onSignOut={signOut} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className={activeTab === "tiers" ? "" : "hidden"}>
            <TierBoard user={user} />
          </div>
          <div className={activeTab === "discovery" ? "" : "hidden"}>
            <DiscoveryHub settings={settings} user={user} />
          </div>
          <div className={activeTab === "stats" ? "" : "hidden"}>
            <StatsPage songs={songs} containers={containers} />
          </div>
          <div className={activeTab === "battle" ? "" : "hidden"}>
            <BattlePage groups={allGroups} containers={containers} onApplyTierList={applyTierList} />
          </div>
          <div className={activeTab === "import" ? "" : "hidden"}>
            <ImportPage onImported={addSongs} importedCount={songs.length} />
          </div>
        </main>
      </div>
    </div>
  );
}
