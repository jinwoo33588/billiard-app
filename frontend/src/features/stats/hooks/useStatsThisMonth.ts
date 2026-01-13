import { useCallback, useEffect, useState } from "react";
import type { StatsResponse } from "../types";
import { fetchStatsThisMonth } from "../api";

export function useStatsThisMonth(now?: string, enabled = true) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStatsThisMonth(now);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [now]);

  useEffect(() => {
    if (!enabled) return;
    refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}