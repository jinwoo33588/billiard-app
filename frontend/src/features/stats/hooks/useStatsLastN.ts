import { useCallback, useEffect, useState } from "react";
import type { StatsResponse } from "../types";
import { fetchStatsLastN } from "../api";

export function useStatsLastN(n: number = 20, enabled = true) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const k = Math.max(1, Math.min(Number(n) || 20, 2000));
  const canRun = enabled && k > 0;

  const refetch = useCallback(async () => {
    if (!canRun) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStatsLastN(k);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [canRun, k]);

  useEffect(() => {
    if (!canRun) return;
    refetch();
  }, [canRun, refetch]);

  return { data, loading, error, refetch, n: k };
}