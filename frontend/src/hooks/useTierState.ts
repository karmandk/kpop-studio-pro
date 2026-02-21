import { useState, useEffect, useCallback, useRef } from "react";
import type { TierContainer } from "../lib/types";
import { fetchTiers, saveTiers } from "../lib/api";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

const DEFAULT_TIERS: TierContainer[] = [
  { header: "PEAK", items: ["aespa", "MEOVV", "BabyMonster", "ILLIT", "STAYC", "IVE"] },
  { header: "SSS", items: ["tripleS"] },
  { header: "S", items: ["Kep1er", "izna", "NMIXX", "LE SSERAFIM", "H//PE Princess", "BLACKPINK", "ITZY", "Red Velvet"] },
  { header: "A", items: ["H1-KEY", "FIFTY FIFTY", "baby DONT cry", "NewJeans", "Billlie", "Kiiikiii", "Hearts2Hearts", "QWER", "RESCENE", "ifeye", "KIIRAS", "ARTMS"] },
  { header: "B", items: ["fromis_9", "TWICE", "BADVILLAIN", "I-DLE", "KISS OF LIFE", "VVS", "VIVIZ", "AtHeart"] },
  { header: "C", items: ["PURPLE KISS", "MAMAMOO", "CLC", "EVERGLOW", "XG", "KATSEYE", "TRI.BE", "YOUNG POSSE"] },
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

  const allGroups = containers.flatMap((c) => c.items);

  return { containers, setContainers: persistContainers, loading, error, allGroups };
}
