// frontend/src/pages/HomePage.tsx
import React, { useState } from "react";
import { Stack, Group, Text, SegmentedControl } from "@mantine/core";
import { useHomeDashboard } from "../features/home/useHomeDashboard";
import StatsBlock from "../features/stats/components/StatsBlock";
import GameListWithEdit from "../features/games/components/GameListWithEdit";
import StatsSection from "../features/stats/components/StatsSection";

export default function HomePage() {
  const [recentN, setRecentN] = useState(10);

  const { loading, error, refetch, meta, statsAll, statsThisMonth, statsRecent, recentGames } =
    useHomeDashboard({ recentN });

  // error UI는 너 스타일대로 유지

  return (
    <Stack gap="md" style={{ padding: 12 }}>
      <Group justify="space-between">
        <Text fw={900}>대시보드</Text>

        {/* ✅ 최근 N 선택 UI (원하면 나중에 숨겨도 됨) */}
        <SegmentedControl
          size="xs"
          value={String(recentN)}
          onChange={(v) => setRecentN(Number(v))}
          data={[
            { label: "10", value: "10" },
            { label: "20", value: "20" },
            { label: "30", value: "30" },
          ]}
        />
      </Group>

      <StatsSection title="전체" subtitle="전체 기록 기준" stats={statsAll} loading={loading} />
      <StatsSection
        title="이번달"
        subtitle={`${meta.fromThisMonth} ~ ${meta.toToday}`}
        stats={statsThisMonth}
        loading={loading}
      />
      <StatsSection
        title={`최근 ${meta.recentN}게임`}
        subtitle={`최근 ${meta.recentN}판 기준`}
        stats={statsRecent}
        loading={loading}
      />

      <div>
        <Text fw={900} mb={8}>최근 게임</Text>
        <GameListWithEdit games={recentGames}  />
      </div>
    </Stack>
  );
}