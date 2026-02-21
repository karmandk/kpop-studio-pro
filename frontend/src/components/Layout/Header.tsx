import { LayoutGrid, Disc3 } from "lucide-react";

type Tab = "tiers" | "discovery";

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "tiers", label: "Tier Designer", icon: <LayoutGrid className="w-4 h-4" /> },
    { id: "discovery", label: "Discovery Hub", icon: <Disc3 className="w-4 h-4" /> },
  ];

  return (
    <header className="shrink-0 border-b border-white/5 bg-gray-900/30">
      <div className="flex items-center gap-1 px-6 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl
              transition-all border border-b-0
              ${
                activeTab === tab.id
                  ? "bg-gray-950 border-white/10 text-white"
                  : "bg-transparent border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
}
