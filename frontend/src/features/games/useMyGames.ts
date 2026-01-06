// frontend/src/features/games/useMyGames.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Game } from "./types";
import { listMyGamesApi } from "./api";
import { useAuth } from "../auth/useAuth";

type UseMyGamesOptions = {
  limit?: number;      // 예: 홈은 10
  enabled?: boolean;   // 필요하면 끄기
};

export function useMyGames(options: UseMyGamesOptions = {}) {
  const { user } = useAuth();
  const { limit, enabled = true } = options;

  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  // deps 안정화 (limit이 바뀔 때만 refresh가 바뀜)
  const limitKey = useMemo(() => String(limit ?? ""), [limit]);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    if (!user) {
      setGames([]);
      return;
    }

    setLoading(true);
    try {
      const list = await listMyGamesApi(limit ? { limit } : undefined);
      setGames(list);
    } finally {
      setLoading(false);
    }
  }, [user, enabled, limitKey]); // limit 대신 limitKey

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { games, loading, refresh };
}