import React from "react";
import type { Game } from "../types";
import GameCard from "./GameCard";
import { fmtYYMMDD_DOW, fmtMonthLabel } from "../../../shared/utils/date";

type DaySection = { dayKey: string; games: Game[] };
type MonthSection = { monthKey: string; days: DaySection[] };

function groupGamesByMonthThenDay(games: Game[]): MonthSection[] {
  const monthMap = new Map<string, Game[]>();

  for (const g of games) {
    const mk = fmtMonthLabel(g.gameDate);
    const arr = monthMap.get(mk);
    if (arr) arr.push(g);
    else monthMap.set(mk, [g]);
  }

  // 월 최신순
  const monthKeys = Array.from(monthMap.keys()).sort((a, b) => (a < b ? 1 : -1));

  return monthKeys.map((mk) => {
    const monthGames = monthMap.get(mk)!;

    // 월 내부: 일자별 그룹
    const dayMap = new Map<string, Game[]>();
    for (const g of monthGames) {
      const dk = fmtYYMMDD_DOW(g.gameDate);
      const arr = dayMap.get(dk);
      if (arr) arr.push(g);
      else dayMap.set(dk, [g]);
    }

    // 일 최신순
    const dayKeys = Array.from(dayMap.keys()).sort((a, b) => (a < b ? 1 : -1));
    const days = dayKeys.map((dk) => ({ dayKey: dk, games: dayMap.get(dk)! }));

    return { monthKey: mk, days };
  });
}

export default function GameList({ games }: { games: Game[] }) {
  const monthSections = groupGamesByMonthThenDay(games);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      {monthSections.map((m) => (
        <div key={m.monthKey}>
          {/* ✅ 월 헤더 */}
          <div
              style={{
                position: "sticky",
                top: 0,                 // 스크롤 컨테이너의 상단에 붙음
                zIndex: 10,             // 카드들 위로
                background: "var(--mantine-color-body)", // 아래가 비치지 않게
                padding: "10px 2px 8px",
                margin: "0 0 8px",
                borderBottom: "1px solid var(--mantine-color-gray-3)",
                fontWeight: 950,
                fontSize: 16,
              }}
            >            
            {fmtMonthLabel(m.monthKey)}
          </div>

          {/* ✅ 월 안의 날짜 섹션들 */}
          <div style={{ display: "grid", gap: 14 }}>
            {m.days.map((d) => (
              <div key={d.dayKey}>
                <div style={{ fontWeight: 900, fontSize: 13, margin: "6px 2px" }}>
                  {d.dayKey}
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {d.games.map((g) => (
                    <GameCard key={g.id} game={g} showActions />
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
