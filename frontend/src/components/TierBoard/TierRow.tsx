import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import GroupCard from "./GroupCard";
import { TIER_META, type TierName } from "../../lib/types";

interface TierRowProps {
  tierName: string;
  items: string[];
}

export default function TierRow({ tierName, items }: TierRowProps) {
  const meta = TIER_META[tierName as TierName] || {
    label: tierName,
    color: "#888",
    gradient: "from-gray-500/15 to-transparent",
  };

  const { setNodeRef, isOver } = useDroppable({ id: tierName });

  return (
    <div
      className={`
        flex items-stretch rounded-xl border border-white/10 overflow-hidden
        bg-gradient-to-r ${meta.gradient}
        transition-all duration-200
        ${isOver ? "ring-2 ring-offset-1 ring-offset-gray-950" : ""}
      `}
      style={isOver ? { boxShadow: `0 0 0 2px ${meta.color}` } : {}}
    >
      {/* Tier label */}
      <div
        className="w-20 shrink-0 flex flex-col items-center justify-center border-r border-white/10"
        style={{ borderLeftColor: meta.color, borderLeftWidth: 4 }}
      >
        <span className="text-lg font-black tracking-wider" style={{ color: meta.color }}>
          {meta.label}
        </span>
        <span className="text-[10px] text-gray-500 mt-0.5">{items.length} groups</span>
      </div>

      {/* Droppable area with sortable cards */}
      <SortableContext items={items} strategy={rectSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 p-3 flex flex-wrap gap-2.5 items-start content-start min-h-[100px] ${
            items.length === 0 ? "justify-center items-center" : ""
          }`}
        >
          {items.length === 0 && (
            <span className="text-xs text-gray-600 italic px-4">
              Drop groups here
            </span>
          )}
          {items.map((name) => (
            <GroupCard key={name} id={name} name={name} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}
