import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { getRankings } from "./api";
import type { RankingRow } from "./types";

type Mode = "all" | "month";
type SortBy = keyof Pick<RankingRow, "average" | "winRate" | "handicap">;
type SortDir = "desc" | "asc";

export function useRankings() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<RankingRow[]>([]);

  const [mode, setMode] = useState<Mode>("all");
  const [monthValue, setMonthValue] = useState<Date | null>(() => new Date());

  const [sortBy, setSortBy] = useState<SortBy>("average");
  const [sortDirection, setSortDirection] = useState<SortDir>("desc");

  const myRef = useRef<HTMLDivElement | null>(null);

  const myUserId = user?._id ?? null;

  const fetchRanking = useCallback(async () => {
    try {
      setLoading(true);

      const params =
        mode === "month" && monthValue
          ? {
              hasMonthFilter: true as const,
              year: monthValue.getFullYear(),
              month: monthValue.getMonth() + 1,
            }
          : { hasMonthFilter: false as const };

      const data = await getRankings(params);
      setRanking(data);
    } catch (e) {
      console.error("랭킹 조회 실패:", e);
      setRanking([]);
    } finally {
      setLoading(false);
    }
  }, [mode, monthValue]);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  const sortedData = useMemo(() => {
    return [...ranking].sort((a, b) => {
      const av = Number(a[sortBy]);
      const bv = Number(b[sortBy]);
      if (sortDirection === "asc") return av > bv ? 1 : -1;
      return bv > av ? 1 : -1;
    });
  }, [ranking, sortBy, sortDirection]);

  const myIndex = useMemo(() => {
    if (!myUserId) return -1;
    return sortedData.findIndex((r) => String(r.userId) === String(myUserId));
  }, [sortedData, myUserId]);

  const me = myIndex >= 0 ? sortedData[myIndex] : null;

  // ✅ 월별 0전 등으로 랭킹에 내 데이터가 없을 때: user 기반 ghost
  const myGhost: RankingRow | null = useMemo(() => {
    if (!user) return null;
    if (me) return null;

    return {
      userId: user._id,
      nickname: user.nickname,
      handicap: user.handicap,
      totalGames: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      average: 0,
      winRate: 0,
    };
  }, [user, me]);

  const renderList = useMemo(() => {
    if (!myGhost) return sortedData;
    return [...sortedData, myGhost];
  }, [sortedData, myGhost]);

  const myRankLabel = useMemo(() => {
    return me ? `#${myIndex + 1} / ${sortedData.length}` : "이번 달 순위 없음 (0전)";
  }, [me, myIndex, sortedData.length]);

  const titleText = useMemo(() => {
    if (mode === "all") return "🏆 전체 랭킹";
    if (monthValue) return `🏆 ${monthValue.getFullYear()}년 ${monthValue.getMonth() + 1}월 랭킹`;
    return "🏆 월별 랭킹";
  }, [mode, monthValue]);

  const handleSortChange = (value: string) => {
    if (value === "average" || value === "winRate" || value === "handicap") {
      setSortBy(value as SortBy);
      setSortDirection("desc");
    }
  };

  const toggleSortDirection = () => {
    setSortDirection((cur) => (cur === "desc" ? "asc" : "desc"));
  };

  return {
    // data
    loading,
    ranking,
    sortedData,
    renderList,

    // mode/month
    mode,
    setMode,
    monthValue,
    setMonthValue,
    titleText,

    // sorting
    sortBy,
    sortDirection,
    handleSortChange,
    toggleSortDirection,

    // me
    myUserId,
    myIndex,
    me,
    myGhost,
    myRankLabel,
    myRef,

    // actions
    refresh: fetchRanking,
  };
}