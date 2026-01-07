import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import type { Game } from "./types";
import { listMyGamesApi } from "./api";
import { useAuth } from "../auth/useAuth";

type UseMyGamesOptions = {
  limit?: number;      // 초기 limit (예: 10)
  step?: number;       // 더보기 증가량 (예: 10)
  enabled?: boolean;
};

export function useMyGames(options: UseMyGamesOptions = {}) {
  const { user } = useAuth();
  const userId = user?._id;
  const { limit = 10, step = 10, enabled = true } = options;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 현재 조회 limit (더보기 누르면 증가)
  const [currentLimit, setCurrentLimit] = useState(limit);

  // 더 이상 불러올 게 있는지(백엔드 total 없으니: "요청한 limit보다 적게 오면 끝"으로 판단)
  const [hasMore, setHasMore] = useState(true);

  const limitKey = useMemo(() => `${currentLimit}`, [currentLimit]);

  const inFlightKeyRef = useRef<string | null>(null);

  const fetchWithLimit = useCallback(
    async (nextLimit: number, mode: "refresh" | "more") => {
      if (!enabled) return;
      
      if (!userId) {
        setGames([]);
        setHasMore(false);
        return;
      }

      const key = `${userId}:${nextLimit}:${mode}`;
      if (inFlightKeyRef.current === key) return;  // ✅ 중복 방지
      inFlightKeyRef.current = key;

      mode === "more" ? setLoadingMore(true) : setLoading(true);

      try {
        const list = await listMyGamesApi({ limit: nextLimit });
        setGames(list);

        // ✅ nextLimit보다 적게 왔다 = 더 없음
        setHasMore(list.length >= nextLimit);
      } finally {
        mode === "more" ? setLoadingMore(false) : setLoading(false);
      }
    },
    [userId, enabled]
  );

  const refresh = useCallback(async () => {
    if (loading || loadingMore) return; // ✅ 가드

    // refresh하면 limit을 초기값으로 리셋하고 다시 가져오기
    setCurrentLimit(limit);
    await fetchWithLimit(limit, "refresh");
  }, [limit, fetchWithLimit]);

  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    if (!hasMore) return;

    const nextLimit = currentLimit + step;
    setCurrentLimit(nextLimit);
    await fetchWithLimit(nextLimit, "more");
  }, [currentLimit, step, fetchWithLimit, hasMore, loadingMore, loading]);


  useEffect(() => {
    
    if (!enabled) return;
  
    if (!userId) {
      setGames([]);
      setHasMore(false);
      return;
    }
  
    // ✅ 초기 로드는 refresh 로직을 “직접” 호출
    setCurrentLimit(limit);
    fetchWithLimit(limit, "refresh");
  }, [userId, enabled, limit, fetchWithLimit]);

  // limitKey는 디버그/추적용(원하면 제거 가능)
  void limitKey;

  return { games, loading, refresh, loadMore, hasMore, loadingMore, currentLimit };
}