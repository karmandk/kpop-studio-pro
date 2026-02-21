import { X } from "lucide-react";
import ReactPlayer from "react-player/youtube";

interface VideoModalProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

export default function VideoModal({ videoId, title, onClose }: VideoModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl mx-4 bg-gray-900 rounded-2xl border border-white/10 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <h3 className="font-bold text-sm truncate">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="aspect-video">
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${videoId}`}
            width="100%"
            height="100%"
            playing
            controls
          />
        </div>
      </div>
    </div>
  );
}
