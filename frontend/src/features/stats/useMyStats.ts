// src/features/stats/useMyStats.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/useAuth";
import type { BuildStatsResponse, StatsSelector } from "./types";
import { getMyStatsApi } from "./api";

type UseMyStatsArgs = {
  selector: StatsSelector;
  enabled?: boolean; // default true
};

export function useMyStats({ selector, enabled = true }: UseMyStatsArgs) {
  const { user } = useAuth();
  const [data, setData] = useState<BuildStatsResponse | null>(null);
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
      const res = await getMyStatsApi(selector);
      setData(res);
    } catch (e: any) {
      setData(null);
      setErrorMsg(e?.response?.data?.message ?? e?.message ?? "통계 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [enabled, user, selectorKey]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, errorMsg, refresh };
}