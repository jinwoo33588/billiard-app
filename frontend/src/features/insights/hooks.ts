// frontend/src/features/insights/hooks.ts
import { useCallback, useEffect, useState } from "react";
import { getMyInsightsApi } from "./api";
import type { InsightsResponse } from "./types";

export function useMyInsights(windowSize: number) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const d = (await getMyInsightsApi(windowSize)) as InsightsResponse;
      setData(d);
    } catch (e: any) {
      setError(e?.response?.data?.message ?? e?.message ?? "Failed to load insights");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [windowSize]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return {
    data,
    loading,
    error,
    refetch: fetch,
  };
}