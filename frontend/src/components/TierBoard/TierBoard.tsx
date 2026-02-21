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
import { useState } from "react";
import TierRow from "./TierRow";
import GroupCard from "./GroupCard";
import { useTierState } from "../../hooks/useTierState";
import { TIER_ORDER } from "../../lib/types";
import { Loader2 } from "lucide-react";

import type { User } from "@supabase/supabase-js";

interface TierBoardProps {
  user?: User | null;
}

export default function TierBoard({ user }: TierBoardProps) {
  const { containers, setContainers, loading, error } = useTierState(user);
  const [activeId, setActiveId] = useState<string | null>(null);

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
    let overContainer = findContainer(over.id as string);

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
            i === activeContainer
              ? { ...c, items: arrayMove(c.items, oldIndex, newIndex) }
              : c,
          ),
        );
      }
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {TIER_ORDER.map((tierName) => {
          const container = containers.find((c) => c.header === tierName);
          return (
            <TierRow
              key={tierName}
              tierName={tierName}
              items={container?.items || []}
            />
          );
        })}
        <DragOverlay>
          {activeId ? <GroupCard id={activeId} name={activeId} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
