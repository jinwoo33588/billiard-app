import { useCallback, useEffect, useState } from "react";
import type { StatsResponse } from "../types";
import { fetchStatsAll } from "../api";

export function useStatsAll(enabled = true) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStatsAll();
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}