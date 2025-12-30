import React, { useMemo } from 'react';
import { Card, Title, Text, Group, Badge, Divider, Stack, SimpleGrid } from '@mantine/core';
import type { Game } from './GameList';

type Stats = {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  totalScore: number;
  totalInnings: number;
  winRateNum: number; // 0~100
  winRate: string; // "60.0"
  average: string; // "0.888"
};

function calcStats(games: Game[]): Stats {
  const base = games.reduce(
    (acc, game) => {
      acc.totalGames += 1;
      acc.totalScore += Number(game.score) || 0;
      acc.totalInnings += Number(game.inning) || 0;

      if (game.result === '승') acc.wins += 1;
      else if (game.result === '무') acc.draws += 1;
      else if (game.result === '패') acc.losses += 1;

      return acc;
    },
    { totalGames: 0, wins: 0, draws: 0, losses: 0, totalScore: 0, totalInnings: 0 }
  );

  // ✅ 네 기존 정의 유지: 무승부 제외(승/패) 기준 승률
  const denom = base.totalGames - base.draws;
  const winRateNum = denom > 0 ? (base.wins / denom) * 100 : 0;
  const winRate = winRateNum.toFixed(1);

  const average = base.totalInnings > 0 ? (base.totalScore / base.totalInnings).toFixed(3) : '0.000';

  return { ...base, winRateNum, winRate, average };
}

function winRateColor(winRateNum: number) {
  return winRateNum >= 66 ? 'green' : winRateNum >= 60 ? 'blue' : winRateNum >= 30 ? 'orange' : 'red';
}

function glassBadgeStyle(color: string) {
  return {
    background: 'rgba(255,255,255,0.75)',
    color,
    border: '1px solid rgba(0,0,0,0.06)',
  } as const;
}

function filterThisMonth(games: Game[]) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  return games.filter((g) => {
    const d = new Date(g.gameDate);
    return d >= start && d < end;
  });
}

function formatYYMM(now: Date) {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  return `${yy}.${mm}`;
}

function StatsBlock({
  label,
  subtitle,
  stats,
  accent,
}: {
  label: string;
  subtitle: string;
  stats: Stats;
  accent: string;
}) {
  const color = winRateColor(stats.winRateNum);

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        background: 'rgba(255,255,255,0.65)',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      {/* 헤더 */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text fw={900} style={{ lineHeight: 1.1 }}>
              {label}
            </Text>
            <Badge radius="xl" size="sm" variant="light" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
              {stats.totalGames}판
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
            {subtitle}
          </Text>
        </div>

        <Badge radius="xl" size="sm" variant="filled" style={{ background: accent, color: 'white' }}>
          KPI
        </Badge>
      </Group>

      <Divider my="xs" style={{ borderColor: 'rgba(0,0,0,0.08)' }} />

      {/* ✅ 메인: 승률 + 에버 2개만 크게 */}
      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
        {/* 승률(메인) + 전적(서브) */}
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">
            승률
          </Text>

          <Group justify="center" gap={6} align="baseline" mt={8} wrap="nowrap">
            <Text
              size="xl"
              fw={900}
              style={{
                lineHeight: 1,
                color: `var(--mantine-color-${color}-7)`,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {stats.winRate}
            </Text>
            <Text size="sm" c="dimmed">
              %
            </Text>
          </Group>

          {/* ✅ 승률 아래 전적을 "작게" */}
          <Group justify="center" gap={6} mt={10} wrap="wrap">
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle('var(--mantine-color-green-7)')}>
              {stats.wins}승
            </Badge>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle('var(--mantine-color-gray-7)')}>
              {stats.draws}무
            </Badge>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle('var(--mantine-color-red-7)')}>
              {stats.losses}패
            </Badge>
          </Group>
        </div>

        {/* 에버(메인) + 총 이닝(서브) */}
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" c="dimmed">
            에버
          </Text>

          <Text
            size="xl"
            fw={900}
            mt={8}
            style={{
              lineHeight: 1,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {stats.average}
          </Text>

          <Group justify="center" mt={10}>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle('var(--mantine-color-gray-7)')}>
              총 {stats.totalInnings}이닝
            </Badge>
          </Group>
        </div>
      </SimpleGrid>
    </Card>
  );
}

export default function StatsOverview({ games }: { games: Game[] }) {
  const allStats = useMemo(() => calcStats(games), [games]);

  const monthGames = useMemo(() => filterThisMonth(games), [games]);
  const monthStats = useMemo(() => calcStats(monthGames), [monthGames]);

  const now = useMemo(() => new Date(), []);
  const monthLabel = formatYYMM(now);

  return (
    <Card
      p="sm"
      radius="md"
      withBorder
      style={{
        background: 'rgba(228, 240, 255, 0.12)',
        borderColor: 'rgba(0,0,0,0.06)',
      }}
    >
      <Group justify="space-between" align="center" mb={6} wrap="nowrap">
        <Title order={4} style={{ lineHeight: 1.1 }}>
          종합 통계
        </Title>
        <Badge radius="xl" variant="light" style={{ border: '1px solid rgba(0,0,0,0.06)' }}>
          전체 · 이번달
        </Badge>
      </Group>

      <Text size="xs" c="dimmed" mb="sm">
        승률/에버를 메인으로 보고, 전적은 승률 아래에서 빠르게 확인합니다.
      </Text>

      <Stack gap="sm">
        <StatsBlock label="전체" subtitle="모든 기록 기준" stats={allStats} accent="var(--mantine-color-blue-6)" />
        <StatsBlock
          label="이번 달"
          subtitle={`${monthLabel} 기준 (0판이어도 표시)`}
          stats={monthStats}
          accent="var(--mantine-color-teal-6)"
        />
      </Stack>
    </Card>
  );
}