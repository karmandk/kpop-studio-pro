import { useState, useEffect, useCallback, useRef } from "react";
import type { TierContainer } from "../lib/types";
import { fetchTiers, saveTiers } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const DEFAULT_TIERS: TierContainer[] = [
  { header: "PEAK", items: ["aespa", "MEOVV", "BabyMonster", "ILLIT", "STAYC", "IVE"], color: "#FFD700" },
  { header: "SSS", items: ["tripleS"], color: "#9D50BB" },
  { header: "S", items: ["Kep1er", "izna", "NMIXX", "LE SSERAFIM", "H//PE Princess", "BLACKPINK", "ITZY", "Red Velvet"], color: "#ff4b4b" },
  { header: "A", items: ["H1-KEY", "FIFTY FIFTY", "baby DONT cry", "NewJeans", "Billlie", "Kiiikiii", "Hearts2Hearts", "QWER", "RESCENE", "ifeye", "KIIRAS", "ARTMS"], color: "#00C9FF" },
  { header: "B", items: ["fromis_9", "TWICE", "BADVILLAIN", "I-DLE", "KISS OF LIFE", "VVS", "VIVIZ", "AtHeart"], color: "#92FE9D" },
  { header: "C", items: ["PURPLE KISS", "MAMAMOO", "CLC", "EVERGLOW", "XG", "KATSEYE", "TRI.BE", "YOUNG POSSE"], color: "#bdc3c7" },
];

async function loadFromSupabase(userId: string): Promise<TierContainer[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("user_tiers")
    .select("tier_data")
    .eq("user_id", userId)
    .single();
  if (error || !data) return null;
  return data.tier_data as TierContainer[];
}

async function saveToSupabase(userId: string, containers: TierContainer[]) {
  if (!supabase) return;
  await supabase.from("user_tiers").upsert(
    { user_id: userId, tier_data: containers, updated_at: new Date().toISOString() },
    { onConflict: "user_id" },
  );
}

export function useTierState(user?: User | null) {
  const [containers, setContainers] = useState<TierContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (supabase && user) {
          const data = await loadFromSupabase(user.id);
          if (!cancelled) setContainers(data || DEFAULT_TIERS);
        } else {
          const data = await fetchTiers();
          if (!cancelled) setContainers(data.length > 0 ? data : DEFAULT_TIERS);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Load failed");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user]);

  const persistContainers = useCallback(
    (updated: TierContainer[]) => {
      setContainers(updated);
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      saveTimeout.current = setTimeout(() => {
        if (supabase && user) {
          saveToSupabase(user.id, updated).catch((e) => console.error("Save failed:", e));
        } else {
          saveTiers(updated).catch((e) => console.error("Save failed:", e));
        }
      }, 500);
    },
    [user],
  );

  const addTier = useCallback((header: string, color: string) => {
    setContainers((prev) => {
      const updated = [...prev, { header, items: [], color }];
      persistContainers(updated);
      return updated;
    });
  }, [persistContainers]);

  const removeTier = useCallback((index: number) => {
    setContainers((prev) => {
      if (prev.length <= 1) return prev;
      const removed = prev[index];
      const targetIdx = index === 0 ? 1 : index - 1;
      const updated = prev.map((c, i) => {
        if (i === targetIdx) return { ...c, items: [...c.items, ...removed.items] };
        return c;
      }).filter((_, i) => i !== index);
      persistContainers(updated);
      return updated;
    });
  }, [persistContainers]);

  const renameTier = useCallback((index: number, newHeader: string) => {
    setContainers((prev) => {
      const updated = prev.map((c, i) => i === index ? { ...c, header: newHeader } : c);
      persistContainers(updated);
      return updated;
    });
  }, [persistContainers]);

  const recolorTier = useCallback((index: number, color: string) => {
    setContainers((prev) => {
      const updated = prev.map((c, i) => i === index ? { ...c, color } : c);
      persistContainers(updated);
      return updated;
    });
  }, [persistContainers]);

  const moveTier = useCallback((index: number, direction: "up" | "down") => {
    setContainers((prev) => {
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[target]] = [updated[target], updated[index]];
      persistContainers(updated);
      return updated;
    });
  }, [persistContainers]);

  const resetToDefault = useCallback(() => {
    persistContainers(DEFAULT_TIERS);
  }, [persistContainers]);

  const allGroups = containers.flatMap((c) => c.items);

  return {
    containers,
    setContainers: persistContainers,
    loading,
    error,
    allGroups,
    addTier,
    removeTier,
    renameTier,
    recolorTier,
    moveTier,
    resetToDefault,
  };
}
