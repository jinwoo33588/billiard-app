import { useCallback, useEffect, useMemo, useState } from "react";
import type { RankingMetric, RankingMode, RankingResponse } from "./types";
import { getRankingApi } from "./ranking.api";

type State = {
  loading: boolean;
  error: string | null;
  data: RankingResponse | null;
};

export function useRanking(opts: { mode: RankingMode; metric: RankingMetric; limit?: number }) {
  const [state, setState] = useState<State>({ loading: true, error: null, data: null });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  // ✅ deps를 안정적으로 만들기
  const params = useMemo(
    () => ({ mode: opts.mode, metric: opts.metric, limit: opts.limit ?? 50 }),
    [opts.mode, opts.metric, opts.limit]
  );

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const data = await getRankingApi(params);
        if (!mounted) return;

        // rank가 없으면 프론트에서 채움
        const items = (data.items ?? []).map((it, idx) => ({
          ...it,
          rank: Number.isFinite(it.rank) && it.rank > 0 ? it.rank : idx + 1,
        }));

        setState({ loading: false, error: null, data: { ...data, items } });
      } catch (e: any) {
        if (!mounted) return;
        setState({ loading: false, error: e?.message ?? "failed to load", data: null });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [params, tick]);

  return { ...state, reload };
}