// src/features/users/useUserProfile.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Game } from "../games/types";
import type { PublicUser } from "./types";
import { getUserProfileApi, listUserGamesApi } from "./api";

type UseUserProfileOptions = {
  userId?: string;
  limit?: number;      // 예: 프로필에서 최근 20개만
  enabled?: boolean;
};

export function useUserProfile(options: UseUserProfileOptions) {
  const { userId, limit, enabled = true } = options;

  const [user, setUser] = useState<PublicUser | null>(null);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const userIdKey = useMemo(() => String(userId ?? ""), [userId]);
  const limitKey = useMemo(() => String(limit ?? ""), [limit]);

  const refresh = useCallback(async () => {
    if (!enabled) return;

    if (!userIdKey) {
      setUser(null);
      setGames([]);
      setErrorMsg("");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    try {
      const [u, g] = await Promise.all([
        getUserProfileApi(userIdKey),
        listUserGamesApi(userIdKey, limit ? { limit } : undefined),
      ]);
      setUser(u);
      setGames(Array.isArray(g) ? g : []);
    } catch (e: any) {
      setUser(null);
      setGames([]);
      setErrorMsg(e?.response?.data?.message ?? e?.message ?? "프로필 조회 실패");
    } finally {
      setLoading(false);
    }
  }, [enabled, userIdKey, limitKey]); // 옵션 바뀌면 refresh도 바뀜

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { user, games, loading, errorMsg, refresh };
}