import { Sparkles } from "lucide-react";

interface AiPanelProps {
  analysis: string;
}

export default function AiPanel({ analysis }: AiPanelProps) {
  return (
    <div className="mt-2 ml-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
          AI Analysis
        </span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">{analysis}</p>
    </div>
  );
}
