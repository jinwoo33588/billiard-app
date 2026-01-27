// frontend/src/features/home/useHomeDashboard.ts
import { useMemo, useCallback } from "react";
import { useGames } from "../games/useGames";
import { useStats } from "../stats/useStats";
import { dayKeyLocal } from "../../shared/utils/date";

type Options = {
  recentN?: number; // ✅ 여기만 바꾸면 홈 전체 recent 기준이 바뀜
};

function monthStartKeyLocal(now: Date) {
  return dayKeyLocal(new Date(now.getFullYear(), now.getMonth(), 1));
}

export function useHomeDashboard(options?: Options) {
  const recentN = options?.recentN ?? 10;

  const now = useMemo(() => new Date(), []);
  const fromThisMonth = useMemo(() => monthStartKeyLocal(now), [now]);
  const toToday = useMemo(() => dayKeyLocal(now), [now]);

  // ✅ recent 기준을 여기서 통일
  const games = useGames({ limit: recentN });
  const statsAll = useStats();
  const statsThisMonth = useStats({ from: fromThisMonth, to: toToday });
  const statsRecent = useStats({ limit: recentN });

  const loading =
    games.loading || statsAll.loading || statsThisMonth.loading || statsRecent.loading;

  const error =
    games.error || statsAll.error || statsThisMonth.error || statsRecent.error || null;

  const refetch = useCallback(async () => {
    games.reload();
    statsAll.reload();
    statsThisMonth.reload();
    statsRecent.reload();
  }, [games, statsAll, statsThisMonth, statsRecent]);

  return {
    loading,
    error,
    refetch,
    meta: { fromThisMonth, toToday, recentN },

    recentGames: games.games,
    statsAll: statsAll.stats,
    statsThisMonth: statsThisMonth.stats,
    statsRecent: statsRecent.stats,
  };
}