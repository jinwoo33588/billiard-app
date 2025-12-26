import React, { useMemo } from 'react';
import { Game } from './GameList';
import { Card, Title, Text, SimpleGrid, Group, Badge, Divider } from '@mantine/core';

interface StatisticsProps {
  games: Game[];
}

/**
 * 🎨 THEME PRESET
 * - accent: 섹션 포인트 컬러
 * - bg: 카드 배경
 * - border: 상단 라인
 * - title/text: 텍스트 대비
 *
 * 아래 3개 중 하나만 골라서 theme = PRESETS.blue 이런 식으로 쓰면 됨
 */
const PRESETS = {
  blue: {
    bg: 'rgba(228, 240, 255, 0.1)',
    border: 'var(--mantine-color-blue-5)',
    title: 'var(--mantine-color-blue-9)',
    text: 'var(--mantine-color-blue-9)',
    sub: 'var(--mantine-color-blue-7)',
  },
  indigo: {
    bg: 'var(--mantine-color-indigo-0)',
    border: 'var(--mantine-color-indigo-5)',
    title: 'var(--mantine-color-indigo-9)',
    text: 'var(--mantine-color-indigo-9)',
    sub: 'var(--mantine-color-indigo-7)',
  },
  teal: {
    bg: 'var(--mantine-color-teal-0)',
    border: 'var(--mantine-color-teal-5)',
    title: 'var(--mantine-color-teal-9)',
    text: 'var(--mantine-color-teal-9)',
    sub: 'var(--mantine-color-teal-7)',
  },
} as const;

const glassBadgeStyle = (color: string) => ({
  background: 'rgba(255,255,255,0.7)',
  color,
  border: '1px solid rgba(0,0,0,0.06)',
});

function Statistics({ games }: StatisticsProps) {
  const theme = PRESETS.blue; // ✅ 여기만 indigo / teal 로 바꾸면 됨

  

  const stats = useMemo(() => {
    return games.reduce(
      (acc, game) => {
        acc.totalGames += 1;
        acc.totalScore += game.score;
        acc.totalInnings += game.inning;
        if (game.result === '승') acc.wins += 1;
        else if (game.result === '무') acc.draws += 1;
        else if (game.result === '패') acc.losses += 1;
        return acc;
      },
      { totalGames: 0, wins: 0, draws: 0, losses: 0, totalScore: 0, totalInnings: 0 }
    );
  }, [games]);

  const winRateNum = stats.totalGames > 0 ? (stats.wins / stats.totalGames) * 100 : 0;
  const winRate = winRateNum.toFixed(1);
  const average = stats.totalInnings > 0 ? (stats.totalScore / stats.totalInnings).toFixed(3) : '0.000';

  // ✅ 승률에 따라 숫자 강조 색(너무 튀지 않게)
  const winRateColor =
    winRateNum >= 60 ? 'green' : winRateNum >= 45 ? 'blue' : winRateNum >= 30 ? 'orange' : 'red';

  return (
    <Card
      p="sm"
      radius="md"
      withBorder
      style={{
        background: theme.bg,
        borderColor: 'rgba(0,0,0,0.06)',
        borderTop: `3px solid ${theme.border}`,
      }}
    >
      {/* 헤더 */}
      <Group justify="space-between" align="center" mb={6} wrap="nowrap">
        <Title order={4} style={{ lineHeight: 1.1, color: theme.title }}>
          종합 통계
        </Title>

        <Badge
          radius="xl"
          size="sm"
          variant="filled"
          style={{ background: theme.border, color: 'white' }}
        >
          {stats.totalGames}판
        </Badge>
      </Group>

      <Divider my="xs" style={{ borderColor: 'rgba(0,0,0,0.08)' }} />

      {/* ✅ 모바일: 1열 / 태블릿+: 3열 */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" verticalSpacing="sm">
        {/* 총 전적 */}
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" style={{ color: theme.sub }}>
            총 전적
          </Text>

          <Group justify="center" gap={6} mt={6} wrap="wrap">
  <Badge
    radius="xl"
    size="lg"
    style={glassBadgeStyle('var(--mantine-color-green-7)')}
  >
    {stats.wins}승
  </Badge>

  <Badge
    radius="xl"
    size="lg"
    style={glassBadgeStyle('var(--mantine-color-gray-7)')}
  >
    {stats.draws}무
  </Badge>

  <Badge
    radius="xl"
    size="lg"
    style={glassBadgeStyle('var(--mantine-color-red-7)')}
  >
    {stats.losses}패
  </Badge>
</Group>
        </div>

        {/* 승률 */}
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" style={{ color: theme.sub }}>
            승률
          </Text>

          <Group justify="center" gap={6} align="baseline" mt={6} wrap="nowrap">
            <Text size="xl" fw={800} style={{ lineHeight: 1, color: `var(--mantine-color-${winRateColor}-7)` }}>
              {winRate}
            </Text>
            <Text size="sm" style={{ color: theme.sub }}>
              %
            </Text>
          </Group>

          
        </div>

        {/* 에버리지 */}
        <div style={{ textAlign: 'center' }}>
          <Text size="xs" style={{ color: theme.sub }}>
            에버리지
          </Text>

          <Text size="xl" fw={800} mt={6} style={{ lineHeight: 1, color: theme.text }}>
            {average}
          </Text>

          {/* 옵션: 평균이 높으면 배지로 강조 */}
          <Group justify="center" mt={6}>
            <Badge
              radius="xl"
              variant="light"
              style={{
                background: 'rgba(255,255,255,0.7)',
                color: theme.sub,
                border: '1px solid rgba(0,0,0,0.06)',
              }}
            >
              총 {stats.totalInnings}이닝
            </Badge>
          </Group>
        </div>
      </SimpleGrid>
    </Card>
  );
}

export default Statistics;