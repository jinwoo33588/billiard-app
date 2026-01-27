import React, { useMemo, useState } from "react";
import type { DatesRangeValue } from "@mantine/dates";
import { useGames } from "../features/games/useGames";

import GameListWithEdit from "../features/games/components/GameListWithEdit";
import type { Game } from "../features/games/types";
import GamePeriodFilter from "../features/games/components/GamePeriodFilter";

function startOfThisMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfThisMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function getYmdParts(iso: string) {
  // iso: "2026-01-15T..." or "2026-01-15"
  const y = Number(iso.slice(0, 4));
  const m1 = Number(iso.slice(5, 7)); // 1~12
  return { y, m0: m1 - 1 }; // 0-based month
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function yearMonthToRange(selectedYear: number, selectedMonth0: number | null) {
  if (selectedMonth0 === null) return { from: `${selectedYear}-01-01`, to: `${selectedYear}-12-31` };
  const from = new Date(selectedYear, selectedMonth0, 1);
  const to = new Date(selectedYear, selectedMonth0 + 1, 0);
  return { from: ymd(from), to: ymd(to) };
}

export default function GamesPage() {
  // ✅ 기본값: 이번달 range
  const [dateRange, setDateRange] = useState<DatesRangeValue<Date>>([
    startOfThisMonth(),
    endOfThisMonth(),
  ]);
  // ✅ 기본값: custom(기간필터가 적용된 상태)
  const [filterMode, setFilterMode] = useState<"all" | "custom" | "yearMonth">("custom");

  // year/month pill은 선택 안 한 상태로 둬도 됨(기간필터가 우선이니까)
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth0, setSelectedMonth0] = useState<number | null>(null);

  const query = useMemo(() => {
    if (filterMode === "custom") {
      const [fromD, toD] = dateRange ?? [null, null];
      return { from: fromD ? ymd(fromD) : undefined, to: toD ? ymd(toD) : undefined };
    }
    if (filterMode === "yearMonth" && selectedYear !== null) {
      return yearMonthToRange(selectedYear, selectedMonth0);
    }
    return {};
  }, [filterMode, dateRange, selectedYear, selectedMonth0]);

  // ✅ 1) pill 옵션(연/월/카운트)용: 항상 전체 범위
  const meta = useGames({ limit: 500 });

  // ✅ 2) 실제 리스트용: 필터 적용
  const filtered = useGames({ limit: 200, from: query.from, to: query.to });

  // ✅ pill 계산은 meta.games 기준으로
  const { years, monthsInYear, monthCounts } = useMemo(() => {
    const src = meta.games; // 🔥 여기 중요

    const yearSet = new Set<number>();
    const ymCount = new Map<string, number>(); // "YYYY-MM" -> count

    for (const g of src) {
      const { y, m0 } = getYmdParts(g.gameDate);
      yearSet.add(y);
      const key = `${y}-${String(m0 + 1).padStart(2, "0")}`;
      ymCount.set(key, (ymCount.get(key) ?? 0) + 1);
    }

    const yearsArr = Array.from(yearSet).sort((a, b) => b - a);

    // ✅ month pill은 “선택된 연도” 기준(선택 없으면 최신 연도 기준)
    const baseYear = selectedYear ?? yearsArr[0] ?? null;

    const monthCountsMap = new Map<number, number>(); // m0 -> count
    if (baseYear !== null) {
      for (const [key, count] of ymCount.entries()) {
        const y = Number(key.slice(0, 4));
        const m0 = Number(key.slice(5, 7)) - 1;
        if (y === baseYear) monthCountsMap.set(m0, count);
      }
    }

    const monthsArr = Array.from(monthCountsMap.keys()).sort((a, b) => a - b);

    return { years: yearsArr, monthsInYear: monthsArr, monthCounts: monthCountsMap };
  }, [meta.games, selectedYear]); // ✅ meta.games가 바뀔 때만 재계산

  const pillVariant = (active: boolean) => (active ? "filled" : "light");

  const clearAllFilters = () => {
    setDateRange([null, null]);
    setFilterMode("all");
    setSelectedYear(null);
    setSelectedMonth0(null);
  };

  return (
    <div style={{ padding: 12, display: "grid", gap: 12 }}>
      <GamePeriodFilter
        dateRange={dateRange}
        setDateRange={setDateRange}
        filterMode={filterMode}
        setFilterMode={setFilterMode}
        years={years}
        selectedYear={selectedYear}
        setSelectedYear={setSelectedYear}
        monthsInYear={monthsInYear}
        selectedMonth0={selectedMonth0}
        setSelectedMonth0={setSelectedMonth0}
        monthCounts={monthCounts}
        pillVariant={pillVariant}
        clearAllFilters={clearAllFilters}
      />

      {filtered.loading && <div style={{ padding: 12 }}>Loading...</div>}
      {filtered.error && <div style={{ padding: 12, whiteSpace: "pre-wrap" }}>Error: {filtered.error}</div>}
      {!filtered.loading && !filtered.error && <GameListWithEdit games={filtered.games} />}
    </div>
  );
}