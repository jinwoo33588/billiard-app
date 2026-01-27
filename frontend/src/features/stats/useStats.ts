// frontend/src/features/stats/useStats.ts
import { useCallback, useEffect, useState } from "react";
import type { StatsSummary } from "./types";
import { getMyStats, type GetMyStatsParams } from "./stats.api";

type State = {
  loading: boolean;
  error: string | null;
  stats: StatsSummary | null;
};

export function useStats(params?: GetMyStatsParams) {
  const [state, setState] = useState<State>({
    loading: true,
    error: null,
    stats: null,
  });

  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const stats = await getMyStats(params);
        if (!mounted) return;
        setState({ loading: false, error: null, stats });
      } catch (e: any) {
        if (!mounted) return;
        setState({
          loading: false,
          error: e?.message ?? "failed to load stats",
          stats: null,
        });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [tick, JSON.stringify(params ?? {})]); 
  // ✅ params 객체는 참조가 바뀌기 쉬우니 stringify로 안정화(최소 구현)
  // 더 깔끔하게 하려면 params를 useMemo로 고정해도 됨

  return { ...state, reload };
}