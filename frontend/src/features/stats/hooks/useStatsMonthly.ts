import { useCallback, useEffect, useState } from "react";
import type { MonthlySeriesResponse } from "../types";
import { fetchMonthlySeries } from "../api";

export function useStatsMonthly(params?: { fromMonthKey?: string; toMonthKey?: string }, enabled = true) {
  const [data, setData] = useState<MonthlySeriesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMonthlySeries(params);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [params?.fromMonthKey, params?.toMonthKey]);

  useEffect(() => {
    if (!enabled) return;
    refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch };
}