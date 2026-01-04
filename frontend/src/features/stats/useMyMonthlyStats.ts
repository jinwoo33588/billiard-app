import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { MonthlyStatsResponse, StatsSelector } from "./types";
import { getMyMonthlyStatsApi } from "./api";

type UseMyMonthlyStatsArgs = {
  selector: StatsSelector;
  enabled?: boolean; // default true
};

export function useMyMonthlyStats({ selector, enabled = true }: UseMyMonthlyStatsArgs) {
  const { user } = useAuth();
  const [data, setData] = useState<MonthlyStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectorKey = useMemo(() => JSON.stringify(selector), [selector]);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    if (!user) {
      setData(null);
      setErrorMsg("");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getMyMonthlyStatsApi(selector);
      setData(res);
    } catch (e: any) {
      setData(null);
      setErrorMsg(e?.response?.data?.message ?? e?.message ?? "월별 통계 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [enabled, user, selectorKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, errorMsg, refresh };
}