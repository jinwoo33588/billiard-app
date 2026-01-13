import { useCallback, useEffect, useMemo, useState } from "react";
import type { StatsResponse, StatsSelector } from "../types";
import {
  fetchStatsAll,
  fetchStatsRange,
  fetchStatsThisMonth,
  fetchStatsYearMonth,
  fetchStatsLastN,
} from "../api";

function normalizeSelector(sel: StatsSelector): StatsSelector {
  // type별 기본값/방어
  if (sel.type === "lastN") {
    return { ...sel, n: Math.max(1, Math.min(Number(sel.n) || 10, 2000)) };
  }
  return sel;
}

export function useStats(selector: StatsSelector, enabled = true) {
  const sel = useMemo(() => normalizeSelector(selector), [JSON.stringify(selector)]);

  const [data, setData] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<any>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let res: StatsResponse;

      switch (sel.type) {
        case "all":
          res = await fetchStatsAll();
          break;
        case "range":
          res = await fetchStatsRange(sel.from, sel.to);
          break;
        case "thisMonth":
          res = await fetchStatsThisMonth(sel.now);
          break;
        case "yearMonth":
          res = await fetchStatsYearMonth(sel.year, sel.month);
          break;
        case "lastN":
          res = await fetchStatsLastN(sel.n);
          break;
        default:
          throw new Error(`Unsupported selector: ${(sel as any).type}`);
      }

      setData(res);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [sel]);

  useEffect(() => {
    if (!enabled) return;
    refetch();
  }, [enabled, refetch]);

  return { data, loading, error, refetch, selector: sel };
}