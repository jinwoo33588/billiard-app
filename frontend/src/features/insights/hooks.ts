import { useEffect, useState } from "react";
import type { InsightsResponse } from "./types";
import { fetchMyInsights } from "./api";

export function useMyInsights(windowSize: number) {
  const [data, setData] = useState<InsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);
      const d = await fetchMyInsights(windowSize);
      setData(d);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || "인사이트 불러오기 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowSize]);

  return { data, loading, error, refetch };
}