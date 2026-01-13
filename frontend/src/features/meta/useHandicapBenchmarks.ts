import { useCallback, useEffect, useState } from "react";
import { getHandicapBenchmarksApi } from "./api";
import type { HandicapBenchmark } from "./types";

/**
 * ✅ 전역 캐시(새로고침 전까지 유지)
 * - 홈/인사이트/아카이브 등 어디서든 공통 재사용
 */
let CACHE: {
  rows: HandicapBenchmark[] | null;
  fetchedAt: number;
  inflight: Promise<HandicapBenchmark[]> | null;
} = {
  rows: null,
  fetchedAt: 0,
  inflight: null,
};

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

export function useHandicapBenchmarks(opts?: { ttlMs?: number }) {
  const ttlMs = opts?.ttlMs ?? DEFAULT_TTL_MS;

  const [rows, setRows] = useState<HandicapBenchmark[] | null>(CACHE.rows);
  const [loading, setLoading] = useState<boolean>(!CACHE.rows);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOnce = useCallback(async () => {
    try {
      setErrorMsg(null);

      const fresh = CACHE.rows && Date.now() - CACHE.fetchedAt < ttlMs;
      if (fresh) {
        setRows(CACHE.rows);
        setLoading(false);
        return CACHE.rows;
      }

      if (!CACHE.inflight) {
        CACHE.inflight = (async () => {
          const data = await getHandicapBenchmarksApi();
          CACHE.rows = Array.isArray(data?.rows) ? data.rows : [];
          CACHE.fetchedAt = Date.now();
          return CACHE.rows;
        })().finally(() => {
          CACHE.inflight = null;
        });
      }

      setLoading(true);
      const r = await CACHE.inflight;
      setRows(r);
      setLoading(false);
      return r;
    } catch (e: any) {
      setLoading(false);
      setErrorMsg(e?.message || "benchmarks 로딩 실패");
      return null;
    }
  }, [ttlMs]);

  useEffect(() => {
    fetchOnce();
  }, [fetchOnce]);

  const refresh = useCallback(async () => {
    // 강제 갱신
    CACHE.fetchedAt = 0;
    return fetchOnce();
  }, [fetchOnce]);

  return { rows, loading, errorMsg, refresh };
}