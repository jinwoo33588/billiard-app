import { useCallback, useEffect, useState } from "react";
import type { StatsResponse } from "../types";
import { fetchStatsYearMonth } from "../api";

export function useStatsYearMonth(year?: number | null, month?: number | null, enabled = true) {
  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const canRun =
    enabled &&
    typeof year === "number" &&
    typeof month === "number" &&
    Number.isFinite(year) &&
    Number.isFinite(month);

  const refetch = useCallback(async () => {
    if (!canRun || year == null || month == null) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchStatsYearMonth(year, month);
      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [canRun, year, month]);

  useEffect(() => {
    if (!canRun) return;
    refetch();
  }, [canRun, refetch]);

  return { data, loading, error, refetch, canRun };
}