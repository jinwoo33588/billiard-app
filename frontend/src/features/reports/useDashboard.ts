import { useEffect, useMemo, useState } from "react";
import type { DashboardQuery, DashboardReport } from "./dashboard.types";
import { fetchDashboard } from "./reports.api";

export function useDashboard(query: DashboardQuery) {
  const [data, setData] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<unknown>(null);

  // deps 안정화(객체 비교 문제 방지)
  const key = useMemo(() => JSON.stringify(query ?? {}), [query]);

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError(null);

    fetchDashboard(query)
      .then((d) => {
        if (alive) setData(d);
      })
      .catch((e) => {
        if (alive) setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { data, loading, error, refetch: () => fetchDashboard(query).then(setData) };
}
