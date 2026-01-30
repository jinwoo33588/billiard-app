// GameList.tsx
import { useCallback, useMemo, useState } from "react";
import type { Game } from "../types";
import GameCard from "./GameCard";
import { fmtYYMMDD_DOW, fmtMonthLabel } from "../../../shared/utils/date";

type Props = {
  games: Game[];
  onEdit?: (game: Game) => void;
  onDelete?: (gameId: string) => void;
  showActions?: boolean;
};

type DaySection = { dayKey: string; games: Game[] };
type MonthSection = { monthKey: string; days: DaySection[] };

function groupGamesByMonthThenDay(games: Game[]): MonthSection[] {
  const monthMap = new Map<string, Game[]>();

  for (const g of games) {
    const mk = fmtMonthLabel(g.gameDate); // ✅ 지금은 라벨을 키로 쓰고 있음(일단 유지)
    const arr = monthMap.get(mk);
    if (arr) arr.push(g);
    else monthMap.set(mk, [g]);
  }

  const monthKeys = Array.from(monthMap.keys()).sort((a, b) => (a < b ? 1 : -1));

  return monthKeys.map((mk) => {
    const monthGames = monthMap.get(mk)!;

    const dayMap = new Map<string, Game[]>();
    for (const g of monthGames) {
      const dk = fmtYYMMDD_DOW(g.gameDate);
      const arr = dayMap.get(dk);
      if (arr) arr.push(g);
      else dayMap.set(dk, [g]);
    }

    const dayKeys = Array.from(dayMap.keys()).sort((a, b) => (a < b ? 1 : -1));
    const days = dayKeys.map((dk) => ({ dayKey: dk, games: dayMap.get(dk)! }));

    return { monthKey: mk, days };
  });
}

export default function GameList({ games, onEdit, onDelete, showActions = true }: Props) {
  const [openGameId, setOpenGameId] = useState<string | null>(null);

  const monthSections = useMemo(() => groupGamesByMonthThenDay(games), [games]);

  const toggleGame = useCallback((gameId: string) => {
    setOpenGameId((prev) => (prev === gameId ? null : gameId));
  }, []);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {monthSections.map((m) => (
        <div key={m.monthKey}>
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              background: "var(--mantine-color-body)",
              padding: "10px 2px 8px",
              margin: "0 0 8px",
              borderBottom: "1px solid var(--mantine-color-gray-3)",
              fontWeight: 950,
              fontSize: 16,
            }}
          >
            {fmtMonthLabel(m.monthKey)}
          </div>

          <div style={{ display: "grid", gap: 14 }}>
            {m.days.map((d) => (
              <div key={d.dayKey}>
                <div style={{ fontWeight: 900, fontSize: 13, margin: "6px 2px" }}>
                  {d.dayKey}
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {d.games.map((g) => (
                    <GameCard
                      key={g.id}
                      game={g}
                      showActions={showActions}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      opened={openGameId === g.id}
                      onToggle={toggleGame}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
