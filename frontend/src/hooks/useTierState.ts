import { useState, useEffect, useCallback, useRef } from "react";
import type { TierContainer } from "../lib/types";
import { fetchTiers, saveTiers } from "../lib/api";

export function useTierState() {
  const [containers, setContainers] = useState<TierContainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchTiers()
      .then(setContainers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const persistContainers = useCallback((updated: TierContainer[]) => {
    setContainers(updated);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      saveTiers(updated).catch((e) => console.error("Save failed:", e));
    }, 500);
  }, []);

  const allGroups = containers.flatMap((c) => c.items);

  return { containers, setContainers: persistContainers, loading, error, allGroups };
}
