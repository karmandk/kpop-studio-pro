import { useState } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import type { TierContainer } from "../../lib/types";
import { PRESET_COLORS, getTierColor } from "../../lib/types";

interface TierEditorProps {
  containers: TierContainer[];
  onAdd: (header: string, color: string) => void;
  onRemove: (index: number) => void;
  onRename: (index: number, header: string) => void;
  onRecolor: (index: number, color: string) => void;
  onMove: (index: number, direction: "up" | "down") => void;
}

export default function TierEditor({ containers, onAdd, onRemove, onRename, onRecolor, onMove }: TierEditorProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [colorPickerIdx, setColorPickerIdx] = useState<number | null>(null);

  function handleAdd() {
    const name = newName.trim();
    if (!name || containers.some((c) => c.header === name)) return;
    onAdd(name, newColor);
    setNewName("");
  }

  return (
    <div className="bg-gray-900/60 border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Customize Tiers</p>

      {containers.map((c, i) => {
        const color = getTierColor(c.header, c.color);
        return (
          <div key={c.header} className="flex items-center gap-2">
            {/* Color swatch */}
            <button
              className="w-7 h-7 rounded-lg border-2 border-white/20 shrink-0 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => setColorPickerIdx(colorPickerIdx === i ? null : i)}
              title="Change color"
            />

            {/* Name input */}
            <input
              type="text"
              value={c.header}
              onChange={(e) => onRename(i, e.target.value)}
              className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              style={{ color }}
            />

            <span className="text-[10px] text-gray-600 w-14 text-right shrink-0">
              {c.items.length} groups
            </span>

            {/* Move buttons */}
            <button
              onClick={() => onMove(i, "up")}
              disabled={i === 0}
              className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMove(i, "down")}
              disabled={i === containers.length - 1}
              className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            {/* Delete */}
            <button
              onClick={() => onRemove(i)}
              disabled={containers.length <= 1}
              className="p-1 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
              title={containers.length <= 1 ? "Can't remove last tier" : `Remove (groups move to adjacent tier)`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Color picker dropdown */}
            {colorPickerIdx === i && (
              <div className="absolute z-30 mt-32 ml-0 bg-gray-800 border border-white/10 rounded-lg p-2 shadow-xl">
                <div className="grid grid-cols-5 gap-1.5">
                  {PRESET_COLORS.map((pc) => (
                    <button
                      key={pc}
                      onClick={() => { onRecolor(i, pc); setColorPickerIdx(null); }}
                      className={`w-6 h-6 rounded-md border-2 hover:scale-110 transition-transform ${
                        pc === color ? "border-white" : "border-transparent"
                      }`}
                      style={{ backgroundColor: pc }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add new tier */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <button
          className="w-7 h-7 rounded-lg border-2 border-white/20 shrink-0"
          style={{ backgroundColor: newColor }}
          onClick={() => {
            const idx = PRESET_COLORS.indexOf(newColor);
            setNewColor(PRESET_COLORS[(idx + 1) % PRESET_COLORS.length]);
          }}
          title="Cycle color"
        />
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New tier name..."
          className="flex-1 bg-gray-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 placeholder-gray-600"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 transition-all disabled:opacity-30"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}
