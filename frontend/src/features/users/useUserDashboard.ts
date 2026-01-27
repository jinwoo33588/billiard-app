// frontend/src/features/users/useUserDashboard.ts
import { useEffect, useState } from "react";
import { getUserDashboardApi } from "./users.api";
import type { UserDashboardResponse } from "./types";

type State = {
  loading: boolean;
  error: string | null;
  data: UserDashboardResponse | null;
};

export function useUserDashboard(userId: string | undefined, options?: { recent?: number }) {
  const [state, setState] = useState<State>({ loading: true, error: null, data: null });

  useEffect(() => {
    if (!userId) {
      setState({ loading: false, error: "missing userId", data: null });
      return;
    }

    let mounted = true;

    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const data = await getUserDashboardApi(userId, { recent: options?.recent ?? 10 });
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
  }, [userId, options?.recent]);

  return state;
}