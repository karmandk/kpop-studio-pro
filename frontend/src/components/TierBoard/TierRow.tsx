import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import GroupCard from "./GroupCard";
import { getTierColor } from "../../lib/types";

interface TierRowProps {
  tierName: string;
  items: string[];
  customColor?: string;
}

export default function TierRow({ tierName, items, customColor }: TierRowProps) {
  const color = getTierColor(tierName, customColor);
  const { setNodeRef, isOver } = useDroppable({ id: tierName });

  return (
    <div
      className={`
        flex items-stretch rounded-xl border border-white/10 overflow-hidden
        transition-all duration-200
        ${isOver ? "ring-2 ring-offset-1 ring-offset-gray-950" : ""}
      `}
      style={{
        background: `linear-gradient(to right, ${color}15, transparent)`,
        ...(isOver ? { boxShadow: `0 0 0 2px ${color}` } : {}),
      }}
    >
      <div
        className="w-20 shrink-0 flex flex-col items-center justify-center border-r border-white/10"
        style={{ borderLeftColor: color, borderLeftWidth: 4 }}
      >
        <span className="text-lg font-black tracking-wider" style={{ color }}>
          {tierName}
        </span>
        <span className="text-[10px] text-gray-500 mt-0.5">{items.length} groups</span>
      </div>

      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 p-3 flex flex-wrap gap-2.5 items-start content-start min-h-[100px] ${
            items.length === 0 ? "justify-center items-center" : ""
          }`}
        >
          {items.length === 0 && (
            <span className="text-xs text-gray-600 italic px-4">Drop groups here</span>
          )}
          {items.map((name) => (
            <GroupCard key={name} id={name} name={name} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
