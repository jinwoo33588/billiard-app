// frontend/src/features/insights/useInsights.ts
import { useCallback, useEffect, useState } from "react";
import { getMyInsightsApi } from "./insights.api";
import type { InsightsResponse, WindowMode } from "./types";

type State = {
  loading: boolean;
  error: string | null;
  data: InsightsResponse | null;
};

export function useInsights(options?: {
  mode?: WindowMode;
  limit?: number;
  from?: string;
  to?: string;
}) {
  const [state, setState] = useState<State>({ loading: true, error: null, data: null });
  const [tick, setTick] = useState(0);
  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const data = await getMyInsightsApi(options ?? {});
        if (!mounted) return;
        setState({ loading: false, error: null, data });
      } catch (e: any) {
        if (!mounted) return;
        setState({ loading: false, error: e?.message ?? "failed to load", data: null });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [options?.mode, options?.limit, options?.from, options?.to, tick]);

  return { ...state, reload };
}