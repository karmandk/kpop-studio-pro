import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useState, useRef } from "react";
import { toPng } from "html-to-image";
import TierRow from "./TierRow";
import GroupCard from "./GroupCard";
import TierEditor from "./TierEditor";
import { useTierState } from "../../hooks/useTierState";
import { Loader2, Settings2, Download, X, RotateCcw } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface TierBoardProps {
  user?: User | null;
}

export default function TierBoard({ user }: TierBoardProps) {
  const {
    containers, setContainers, loading, error,
    addTier, removeTier, renameTier, recolorTier, moveTier, resetToDefault,
  } = useTierState(user);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  function findContainer(id: string): number {
    for (let i = 0; i < containers.length; i++) {
      if (containers[i].header === id) return i;
      if (containers[i].items.includes(id)) return i;
    }
    return -1;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);
    if (activeContainer === -1 || overContainer === -1) return;
    if (activeContainer === overContainer) return;

    setContainers(
      containers.map((c, i) => {
        if (i === activeContainer) {
          return { ...c, items: c.items.filter((item) => item !== active.id) };
        }
        if (i === overContainer) {
          const overIndex = c.items.indexOf(over.id as string);
          const insertIndex = overIndex >= 0 ? overIndex : c.items.length;
          return {
            ...c,
            items: [
              ...c.items.slice(0, insertIndex),
              active.id as string,
              ...c.items.slice(insertIndex),
            ],
          };
        }
        return c;
      }),
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;
    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);
    if (activeContainer === -1 || overContainer === -1) return;

    if (activeContainer === overContainer) {
      const container = containers[activeContainer];
      const oldIndex = container.items.indexOf(active.id as string);
      const newIndex = container.items.indexOf(over.id as string);
      if (oldIndex !== newIndex) {
        setContainers(
          containers.map((c, i) =>
            i === activeContainer ? { ...c, items: arrayMove(c.items, oldIndex, newIndex) } : c,
          ),
        );
      }
    }
  }

  async function handleExportImage() {
    if (!boardRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(boardRef.current, {
        backgroundColor: "#030712",
        pixelRatio: 2,
      });
      const link = document.createElement("a");
      link.download = "kpop-tier-list.png";
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error("Export failed:", e);
    } finally {
      setExporting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        Loading tier data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-6 text-red-300">
        Failed to load tiers: {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditMode(!editMode)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
            editMode
              ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
              : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300"
          }`}
        >
          {editMode ? <X className="w-3.5 h-3.5" /> : <Settings2 className="w-3.5 h-3.5" />}
          {editMode ? "Done" : "Edit Tiers"}
        </button>
        <button
          onClick={handleExportImage}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-gray-300 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          Export Image
        </button>
        <button
          onClick={() => { if (confirm("Reset tier list to defaults? This will replace your current arrangement.")) resetToDefault(); }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-gray-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to Default
        </button>
      </div>

      {/* Tier Editor Panel */}
      {editMode && (
        <TierEditor
          containers={containers}
          onAdd={addTier}
          onRemove={removeTier}
          onRename={renameTier}
          onRecolor={recolorTier}
          onMove={moveTier}
        />
      )}

      {/* Tier Board */}
      <div ref={boardRef} className="space-y-3 p-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {containers.map((container) => (
            <TierRow
              key={container.header}
              tierName={container.header}
              items={container.items}
              customColor={container.color}
            />
          ))}
          <DragOverlay>
            {activeId ? <GroupCard id={activeId} name={activeId} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
