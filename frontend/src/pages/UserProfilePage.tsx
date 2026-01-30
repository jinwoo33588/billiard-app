import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Group, Text, Divider } from "@mantine/core";

import { useUserDashboard } from "../features/users/useUserDashboard";
import GameListWithEdit from "../features/games/components/GameListWithEdit";
import type { Game } from "../features/games/types";

import StatsSection from "../features/stats/components/StatsSection";
import StatsTabHeader, { type StatsTab } from "../features/stats/components/StatsTabHeader";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();

  const [tab, setTab] = useState<StatsTab>("thisMonth"); // ✅ 기본값 이번달
  const [recentN, setRecentN] = useState(10);

  const { loading, error, data } = useUserDashboard(id, { recent: recentN });

  if (loading) return <div style={{ padding: 12 }}>Loading...</div>;
  if (error) return <div style={{ padding: 12, whiteSpace: "pre-wrap" }}>Error: {error}</div>;
  if (!data) return <div style={{ padding: 12 }}>No data</div>;

  const user = data.user;
  const games = (data.recentGames ?? []) as Game[];

  // ✅ hook 아닌 “일반 로직”은 return 아래에 둬도 문제 없음
  const picked =
    tab === "all"
      ? { title: "전체", subtitle: "전체 기록 기준", stats: data.stats.all }
      : tab === "thisMonth"
        ? { title: "이번달", subtitle: "이번달 기록 기준", stats: data.stats.thisMonth }
        : { title: `최근 ${recentN}게임`, subtitle: `최근 ${recentN}판 기준`, stats: data.stats.recent };

  return (
    <div style={{ padding: 12, display: "grid", gap: 12 }}>
      {/* ✅ 헤더 카드 */}
      <Card
        withBorder
        radius="md"
        p="sm"
        style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(0,0,0,0.08)" }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <div style={{ minWidth: 0 }}>
            <Text fw={950} style={{ letterSpacing: -0.3, lineHeight: 1.1 }}>
              {user.nickname || "사용자"}
            </Text>
            <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
              HCP {user.handicap}
            </Text>
          </div>
          <Text size="xs" c="dimmed" fw={900}>
            ID {user.id.slice(-6)}
          </Text>
        </Group>
      </Card>

      {/* ✅ 탭 헤더 + 선택된 StatsSection 1개만 */}
      <Card
        withBorder
        radius="md"
        p="sm"
        style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(0,0,0,0.08)" }}
      >
        <StatsTabHeader tab={tab} setTab={setTab} recentN={recentN} setRecentN={setRecentN} />

        <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

        <StatsSection title={picked.title} subtitle={picked.subtitle} stats={picked.stats} loading={false} />
      </Card>

      {/* ✅ 최근 게임 */}
      <Card
        withBorder
        radius="md"
        p="sm"
        style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(0,0,0,0.08)" }}
      >
        <Group justify="space-between" align="center">
          <Text fw={950} style={{ letterSpacing: -0.3 }}>
            최근 경기
          </Text>
          <Text size="xs" c="dimmed" fw={900}>
            {games.length}판
          </Text>
        </Group>

        <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

        <GameListWithEdit games={games} />
      </Card>
    </div>
  );
}
