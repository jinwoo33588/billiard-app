import { useCallback, useEffect, useState } from "react";
import type { Game } from "./types";
import { listMyGamesApi } from "./games.api";

type State = {
  loading: boolean;
  error: string | null;
  games: Game[];
};

const GAMES_CHANGED_EVENT = "games:changed";

export function emitGamesChanged() {
  window.dispatchEvent(new Event(GAMES_CHANGED_EVENT));
}

export function useGames(options?: { limit?: number }) {
  const [state, setState] = useState<State>({ loading: true, error: null, games: [] });
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  // 다른 곳(예: FAB 모달)에서 저장하면 자동 reload
  useEffect(() => {
    const onChanged = () => reload();
    window.addEventListener(GAMES_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(GAMES_CHANGED_EVENT, onChanged);
  }, [reload]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setState((s) => ({ ...s, loading: true, error: null }));
        const games = await listMyGamesApi({ limit: options?.limit });
        if (!mounted) return;
        setState({ loading: false, error: null, games });
      } catch (e: any) {
        if (!mounted) return;
        setState({ loading: false, error: e?.message ?? "failed to load", games: [] });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [options?.limit, tick]);

  return { ...state, reload };
}