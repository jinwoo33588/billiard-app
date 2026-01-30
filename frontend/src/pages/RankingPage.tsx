import React, { useMemo, useState } from "react";
import { Text } from "@mantine/core";
import RankingHeader from "../features/ranking/components/RankingHeader";
import RankingList from "../features/ranking/components/RankingList";
import RankingMyCard from "../features/ranking/components/RankingMyCard";
import RankingSortBar from "../features/ranking/components/RankingSortBar";
import { useRanking } from "../features/ranking/useRanking";
import type {
  RankingItem,
  RankingMetric,
  RankingMode,
  RankingSortDirection,
  RankingSortMetric,
} from "../features/ranking/types";
import { useAuth } from "../features/auth/useAuth"; // ✅ 추가

function getMetricValue(item: RankingItem, metric: RankingSortMetric) {
  if (metric === "handicap") return item.user.handicap ?? NaN;
  if (metric === "winRate") return item.stats.winRate;
  return item.stats.avg;
}

export default function RankingPage() {
  const { user } = useAuth(); // ✅ 추가 (user?.id or user?._id 프로젝트에 맞게)
  const myUserId = (user as any)?.id ?? (user as any)?._id ?? null;

  const [mode, setMode] = useState<RankingMode>("thisMonth");
  const [metric, setMetric] = useState<RankingSortMetric>("avg");
  const [sortDirection, setSortDirection] = useState<RankingSortDirection>("desc");

  const apiMetric: RankingMetric = metric === "handicap" ? "avg" : metric;
  const { loading, error, data, reload } = useRanking({ mode, metric: apiMetric, limit: 50 });

  const sortedItems = useMemo(() => {
    if (!data?.items?.length) return [];

    const direction = sortDirection === "asc" ? 1 : -1;
    const fallback = sortDirection === "asc" ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;

    const decorated = data.items.map((item, index) => {
      const raw = getMetricValue(item, metric);
      const value = Number.isFinite(raw) ? raw : fallback;
      return { item, index, value };
    });

    decorated.sort((a, b) => {
      if (a.value === b.value) return a.index - b.index;
      return a.value > b.value ? direction : -direction;
    });

    return decorated.map((entry, idx) => ({ ...entry.item, rank: idx + 1 }));
  }, [data?.items, metric, sortDirection]);

  const monthValue =
    mode === "thisMonth"
      ? new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(new Date())
      : "전체";

  return (
    <div style={{ padding: 12, display: "grid", gap: 12 }}>
      <RankingHeader
        mode={mode}
        setMode={setMode}
        monthValue={monthValue}
      />

      <RankingMyCard items={sortedItems} myUserId={myUserId} />

      <RankingSortBar
        metric={metric}
        setMetric={setMetric}
        sortDirection={sortDirection}
        setSortDirection={setSortDirection}
      />

      {loading ? (
        <Text size="sm" c="dimmed">
          Loading...
        </Text>
      ) : null}
      {error ? (
        <Text size="sm" c="red" style={{ whiteSpace: "pre-wrap" }}>
          {error}
        </Text>
      ) : null}

      {!loading && !error ? <RankingList items={sortedItems} myUserId={myUserId} /> : null}
    </div>
  );
}
