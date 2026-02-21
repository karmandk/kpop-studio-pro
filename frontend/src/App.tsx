import { useState } from "react";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import TierBoard from "./components/TierBoard/TierBoard";
import DiscoveryHub from "./components/DiscoveryHub/DiscoveryHub";
import type { AppSettings } from "./lib/types";

type Tab = "tiers" | "discovery";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("tiers");
  const [settings, setSettings] = useState<AppSettings>({
    year: "2026",
    llmBackend: "auto",
    groqApiKey: "",
    sortBy: "tier",
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar settings={settings} onSettingsChange={setSettings} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header activeTab={activeTab} onTabChange={setActiveTab} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className={activeTab === "tiers" ? "" : "hidden"}>
            <TierBoard />
          </div>
          <div className={activeTab === "discovery" ? "" : "hidden"}>
            <DiscoveryHub settings={settings} />
          </div>
        </main>
      </div>
    </div>
  );
}
