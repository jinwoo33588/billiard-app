import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Game } from "./types";
import { listMyGamesApi } from "./api";
import { useAuth } from "../auth/useAuth";

type GamesCacheValue = {
  recentGames: Game[];
  allGames: Game[];          // 전체 캐시 (준비되면 이걸 Archive에서 사용)
  allReady: boolean;

  loadingRecent: boolean;
  loadingAll: boolean;

  refreshRecent: () => Promise<void>;
  refreshAll: () => Promise<void>;
};

const GamesCacheContext = createContext<GamesCacheValue | null>(null);

// ✅ 너 데이터 규모에 맞게 조절 (처음엔 3000~5000 추천)
const RECENT_LIMIT = 10;
const ALL_LIMIT = 5000;

export function GamesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?._id;

  const [recentGames, setRecentGames] = useState<Game[]>([]);
  const [allGames, setAllGames] = useState<Game[]>([]);
  const [allReady, setAllReady] = useState(false);

  const [loadingRecent, setLoadingRecent] = useState(false);
  const [loadingAll, setLoadingAll] = useState(false);

  // ✅ 중복 호출/레이스 방지
  const inFlightRef = useRef<{ recent?: string; all?: string }>({});

  const refreshRecent = useCallback(async () => {
    if (!userId) {
      setRecentGames([]);
      return;
    }

    const key = `${userId}:recent:${RECENT_LIMIT}`;
    if (inFlightRef.current.recent === key) return;
    inFlightRef.current.recent = key;

    setLoadingRecent(true);
    try {
      const list = await listMyGamesApi({ limit: RECENT_LIMIT });
      setRecentGames(list);
    } finally {
      setLoadingRecent(false);
      inFlightRef.current.recent = undefined;
    }
  }, [userId]);

  const refreshAll = useCallback(async () => {
    if (!userId) {
      setAllGames([]);
      setAllReady(false);
      return;
    }

    const key = `${userId}:all:${ALL_LIMIT}`;
    if (inFlightRef.current.all === key) return;
    inFlightRef.current.all = key;

    setLoadingAll(true);
    try {
      const list = await listMyGamesApi({ limit: ALL_LIMIT });

      setAllGames(list);
      // ✅ 백엔드 total이 없으니 “ALL_LIMIT보다 적게 오면 전체 다 온 것”으로 판단
      setAllReady(list.length < ALL_LIMIT);
    } finally {
      setLoadingAll(false);
      inFlightRef.current.all = undefined;
    }
  }, [userId]);

  // ✅ 로그인/유저 변경 시: 최근 10개 먼저 → 백그라운드로 전체
  useEffect(() => {
    if (!userId) {
      setRecentGames([]);
      setAllGames([]);
      setAllReady(false);
      return;
    }

    // 1) Home용: 즉시
    refreshRecent();

    // 2) Archive용: 백그라운드 (UI 렌더 후)
    const t = window.setTimeout(() => {
      refreshAll();
    }, 0);

    return () => window.clearTimeout(t);
  }, [userId, refreshRecent, refreshAll]);

  const value = useMemo<GamesCacheValue>(
    () => ({
      recentGames,
      allGames,
      allReady,
      loadingRecent,
      loadingAll,
      refreshRecent,
      refreshAll,
    }),
    [recentGames, allGames, allReady, loadingRecent, loadingAll, refreshRecent, refreshAll]
  );

  return <GamesCacheContext.Provider value={value}>{children}</GamesCacheContext.Provider>;
}

export function useGamesCache() {
  const ctx = useContext(GamesCacheContext);
  if (!ctx) throw new Error("useGamesCache must be used within <GamesProvider />");
  return ctx;
}