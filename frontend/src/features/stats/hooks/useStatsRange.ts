import { useCallback, useEffect, useState } from "react";
import type { StatsResponse } from "../types";
import { fetchStatsRange } from "../api";

export function useStatsRange(from?: string | null, to?: string | null, enabled = true) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const canRun = enabled && !!from && !!to;

  const refetch = useCallback(async () => {
    if (!from || !to) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStatsRange(from, to);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    if (!canRun) return;
    refetch();
  }, [canRun, refetch]);

  return { data, loading, error, refetch, canRun };
}