// frontend/src/features/games/useArchive.ts

import { useEffect, useMemo, useState } from "react";
import type { DatesRangeValue } from "@mantine/dates";
import type { StatsSelector } from "../stats";
import type { Game } from "../games/types";

type FilterMode = "all" | "custom" | "yearMonth";

export function useArchive(gamesForPills: Game[]) {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth0 = now.getMonth(); // 0-based

  const [filterMode, setFilterMode] = useState<FilterMode>("yearMonth");
  const [selectedYear, setSelectedYear] = useState<number | null>(currentYear);
  const [selectedMonth0, setSelectedMonth0] = useState<number | null>(currentMonth0);
  const [dateRange, setDateRange] = useState<DatesRangeValue<Date>>([null, null]);

  // ✅ 정렬 상태(훅이 책임)
  const [sortBy, setSortBy] = useState<keyof Game | null>("gameDate");
  const [reverseSortDirection, setReverseSortDirection] = useState(true);

  const years = useMemo(() => {
    const ys = new Set<number>();
    for (const g of gamesForPills) ys.add(new Date(g.gameDate).getFullYear());
    ys.add(currentYear);
    return Array.from(ys).filter(Number.isFinite).sort((a, b) => b - a);
  }, [gamesForPills, currentYear]);

  const monthsInYear = useMemo(() => {
    if (selectedYear === null) return [];
    const set = new Set<number>();

    for (const g of gamesForPills) {
      const d = new Date(g.gameDate);
      if (d.getFullYear() === selectedYear) set.add(d.getMonth());
    }

    if (selectedYear === currentYear) set.add(currentMonth0);
    if (selectedMonth0 !== null) set.add(selectedMonth0);

    return Array.from(set).sort((a, b) => a - b);
  }, [gamesForPills, selectedYear, selectedMonth0, currentYear, currentMonth0]);

  const monthCounts = useMemo(() => {
    const map = new Map<number, number>();
    if (selectedYear === null) return map;

    for (const g of gamesForPills) {
      const d = new Date(g.gameDate);
      if (d.getFullYear() !== selectedYear) continue;
      const m = d.getMonth();
      map.set(m, (map.get(m) || 0) + 1);
    }
    return map;
  }, [gamesForPills, selectedYear]);

  // year/month pill 선택 시 dateRange 자동 갱신
  useEffect(() => {
    if (filterMode !== "yearMonth") return;

    if (selectedYear === null) {
      setDateRange([null, null]);
      return;
    }

    if (selectedMonth0 === null) {
      const start = new Date(selectedYear, 0, 1);
      const end = new Date(selectedYear, 11, 31);
      end.setHours(23, 59, 59, 999);
      setDateRange([start, end]);
      return;
    }

    const start = new Date(selectedYear, selectedMonth0, 1);
    const end = new Date(selectedYear, selectedMonth0 + 1, 0);
    end.setHours(23, 59, 59, 999);
    setDateRange([start, end]);
  }, [filterMode, selectedYear, selectedMonth0]);

  const clearAllFilters = () => {
    setDateRange([null, null]);
    setFilterMode("all");
    setSelectedYear(null);
    setSelectedMonth0(null);
  };

  const pillVariant = (active: boolean) => (active ? "filled" : "light");

  // ✅ stats selector 생성 (그대로)
  const statsSelector: StatsSelector = useMemo(() => {
    if (filterMode === "all" && !dateRange[0] && !dateRange[1]) {
      return { type: "all" };
    }

    if (filterMode === "yearMonth" && selectedYear !== null) {
      if (selectedMonth0 === null) {
        const from = new Date(selectedYear, 0, 1).toISOString();
        const toD = new Date(selectedYear, 11, 31);
        toD.setHours(23, 59, 59, 999);
        const to = toD.toISOString();
        return { type: "range", from, to };
      }
      return { type: "yearMonth", year: selectedYear, month: selectedMonth0 + 1 };
    }

    const [s, e] = dateRange;
    const from = s ? new Date(s).toISOString() : undefined;
    let to: string | undefined = undefined;
    if (e) {
      const toD = new Date(e);
      toD.setHours(23, 59, 59, 999);
      to = toD.toISOString();
    }
    return { type: "range", ...(from ? { from } : {}), ...(to ? { to } : {}) };
  }, [filterMode, dateRange, selectedYear, selectedMonth0]);

  // ✅ 목록 필터링 (아카이브 리스트 표시용)
  const filteredGames = useMemo(() => {
    const [startDate, endDate] = dateRange;
    if (!startDate && !endDate) return gamesForPills;

    const start = startDate ? new Date(startDate) : new Date(0);
    const endBase = endDate ? new Date(endDate) : startDate ? new Date(startDate) : new Date();
    const end = new Date(endBase);
    end.setHours(23, 59, 59, 999);

    return gamesForPills.filter((g) => {
      const d = new Date(g.gameDate);
      return d >= start && d <= end;
    });
  }, [gamesForPills, dateRange]);

  // ✅ 정렬 적용 (훅이 책임)
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredGames;

    return [...filteredGames].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "gameDate") {
        aValue = new Date(a.gameDate).getTime();
        bValue = new Date(b.gameDate).getTime();
      }

      // number 비교
      if (typeof aValue === "number" && typeof bValue === "number") {
        return reverseSortDirection ? aValue - bValue : bValue - aValue;
      }

      // string 비교
      if (typeof aValue === "string" && typeof bValue === "string") {
        return reverseSortDirection ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }

      return 0;
    });
  }, [filteredGames, sortBy, reverseSortDirection]);

  const setSorting = (field: keyof Game) => {
    const reversed = field === sortBy && !reverseSortDirection;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  return {
    // pills
    filterMode,
    setFilterMode,
    selectedYear,
    setSelectedYear,
    selectedMonth0,
    setSelectedMonth0,
    years,
    monthsInYear,
    monthCounts,
    pillVariant,
    clearAllFilters,

    // date range
    dateRange,
    setDateRange,

    // stats selector
    statsSelector,

    // list
    filteredGames,
    sortedData,

    // sorting state
    sortBy,
    reverseSortDirection,
    setSorting,
  };
}