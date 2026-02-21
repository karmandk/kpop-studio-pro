import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useState } from "react";
import { getArtistThumbnail } from "../../lib/api";

interface GroupCardProps {
  id: string;
  name: string;
}

const thumbCache: Record<string, string> = {};

export default function GroupCard({ id, name }: GroupCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const [thumb, setThumb] = useState<string>(() => thumbCache[name] || "");

  useEffect(() => {
    if (thumbCache[name]) {
      setThumb(thumbCache[name]);
      return;
    }
    const stored = localStorage.getItem(`thumb_${name}`);
    if (stored) {
      thumbCache[name] = stored;
      setThumb(stored);
      return;
    }
    getArtistThumbnail(name).then((url) => {
      if (url) {
        thumbCache[name] = url;
        localStorage.setItem(`thumb_${name}`, url);
        setThumb(url);
      }
    });
  }, [name]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex flex-col items-center min-w-[80px] max-w-[100px] p-2 rounded-xl cursor-grab
        bg-white/5 border border-white/10
        hover:bg-white/10 hover:border-white/20 transition-all
        ${isDragging ? "shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/40" : ""}
      `}
      {...attributes}
      {...listeners}
    >
      {thumb ? (
        <img
          src={thumb}
          alt={name}
          className="w-16 h-16 rounded-xl object-cover border-2 border-white/15 shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-xl bg-gray-700 border-2 border-white/15 shrink-0 flex items-center justify-center text-lg font-bold text-gray-400">
          {name[0]}
        </div>
      )}
      <span
        className="text-[10px] font-semibold text-center leading-tight mt-1.5 w-full break-words hyphens-auto"
        title={name}
      >
        {name}
      </span>
    </div>
  );
}
