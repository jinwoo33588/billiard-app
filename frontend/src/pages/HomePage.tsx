import { useMemo, useState } from "react";
import {
  Stack,
  Group,
  Text,
  Badge,
  Tooltip,
  Button,
  SimpleGrid,
  useMantineTheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { useHomeDashboard } from "../features/home/useHomeDashboard";
import { useGames } from "../features/games/useGames";
import StatsSection from "../features/stats/components/StatsSection";
import GameListWithEdit from "../features/games/components/GameListWithEdit";
import StatsTabHeader from "../features/stats/components/StatsTabHeader";
import type { StatsTab } from "../features/stats/components/StatsTabHeader";
import {
  badgeFromMeanRating,
  badgeFromWinRate,
} from "../shared/utils/formBadges";
import GameCalendarCard from "../features/games/components/GameCalendarCard";

export default function HomePage() {
  const [tab, setTab] = useState<StatsTab>("thisMonth");
  const [recentN, setRecentN] = useState(10);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [recentVisible, setRecentVisible] = useState(10);
  const theme = useMantineTheme();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);

  const {
    loading,
    error,
    meta,
    statsAll,
    statsThisMonth,
    statsRecent,
    recentGames,
  } = useHomeDashboard({ recentN, recentGamesLimit: 100 });
  const monthGames = useGames({
    limit: 500,
    from: meta.fromThisMonth,
    to: meta.toToday,
  });

  // 최근 N판 rating 평균
  const meanRating = useMemo(() => {
    const xs = (recentGames ?? [])
      .map((g: any) => Number(g.rating))
      .filter((n) => Number.isFinite(n));
    if (xs.length === 0) return null;
    return xs.reduce((a, b) => a + b, 0) / xs.length;
  }, [recentGames]);

  // 최근 N판 승률(너 규칙: statsRecent.winRate가 "무 제외"로 이미 계산됨)
  const recentWinRate = useMemo(() => {
    const wr = (statsRecent as any)?.winRate;
    return Number.isFinite(wr) ? Number(wr) : null;
  }, [statsRecent]);

  const ratingBadge = useMemo(
    () => badgeFromMeanRating(meanRating),
    [meanRating],
  );
  const winBadge = useMemo(
    () => badgeFromWinRate(recentWinRate),
    [recentWinRate],
  );

  const statsByTab =
    tab === "all" ? (
      <StatsSection
        title="전체"
        subtitle="전체 기록 기준"
        stats={statsAll}
        loading={loading}
      />
    ) : tab === "thisMonth" ? (
      <StatsSection
        title="이번달"
        subtitle={`${meta.fromThisMonth} ~ ${meta.toToday}`}
        stats={statsThisMonth}
        loading={loading}
      />
    ) : (
      <StatsSection
        title={`최근 ${recentN}게임`}
        subtitle={`최근 ${recentN}판 기준`}
        stats={statsRecent}
        loading={loading}
      />
    );

  const listGames = (recentGames ?? []).slice(0, recentVisible);
  const canLoadMore = (recentGames?.length ?? 0) > listGames.length;

  return (
    <Stack>
      {/* 헤더 */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3, lineHeight: 1.1 }}>
            대시보드
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            최근 {recentN}판 기준
          </Text>
        </div>

        {/*  요즘 폼 배지 2개 */}
        <Group gap={8} wrap="nowrap">
          <Tooltip
            label={ratingBadge.hint || ""}
            withArrow
            disabled={!ratingBadge.hint}
          >
            <Badge
              radius="xl"
              variant="light"
              color={ratingBadge.color as any}
              style={{ fontWeight: 950, border: "1px solid rgba(0,0,0,0.10)" }}
            >
              {ratingBadge.label}
              {ratingBadge.valueText ? ` · ${ratingBadge.valueText}` : ""}
            </Badge>
          </Tooltip>

          <Tooltip
            label={winBadge.hint || ""}
            withArrow
            disabled={!winBadge.hint}
          >
            <Badge
              radius="xl"
              variant="light"
              color={winBadge.color as any}
              style={{ fontWeight: 950, border: "1px solid rgba(0,0,0,0.10)" }}
            >
              {winBadge.label}
              {winBadge.valueText ? ` · ${winBadge.valueText}` : ""}
            </Badge>
          </Tooltip>
        </Group>
      </Group>

      <StatsTabHeader
        tab={tab}
        setTab={setTab}
        recentN={recentN}
        setRecentN={setRecentN}
      />

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing={{ base: "md", lg: "lg" }}>
        <Stack gap="md">
          {statsByTab}

          {!monthGames.loading && !monthGames.error ? (
            <GameCalendarCard
              title="승패 캘린더"
              games={monthGames.games}
              initialDate={meta.fromThisMonth}
              compact={!isDesktop}
              lockMonth
              autoSelect={true}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          ) : null}
        </Stack>

        <div>
          <Group justify="space-between" align="center" mb={8}>
            <Text fw={900}>{`최근 게임`}</Text>
          </Group>
          <GameListWithEdit games={listGames} />
          {canLoadMore ? (
            <Group justify="center" mt={10}>
              <Button
                variant="light"
                onClick={() => setRecentVisible((v) => v + 10)}
              >
                더보기
              </Button>
            </Group>
          ) : null}
        </div>
      </SimpleGrid>

      {error ? <div style={{ whiteSpace: "pre-wrap" }}>{error}</div> : null}
    </Stack>
  );
}
