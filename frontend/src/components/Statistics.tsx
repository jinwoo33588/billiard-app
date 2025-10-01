import React from 'react';
import { Game } from './GameList';
import { Card, Title, Text, SimpleGrid } from '@mantine/core';

interface StatisticsProps {
  games: Game[];
}

function Statistics({ games }: StatisticsProps) {
  const stats = games.reduce(
    (acc, game) => {
      acc.totalGames += 1;
      acc.totalScore += game.score;
      acc.totalInnings += game.inning;
      if (game.result === '승') acc.wins += 1;
      return acc;
    },
    { totalGames: 0, wins: 0, totalScore: 0, totalInnings: 0 }
  );

  const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : '0.0';
  const average = stats.totalInnings > 0 ? (stats.totalScore / stats.totalInnings).toFixed(3) : '0.000';

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">종합 통계</Title>
      {/* [수정] cols를 반응형 객체로 변경합니다. */}
      {/* base: 가장 작은 화면에서는 1줄, sm: small 사이즈 이상에서는 3줄 */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <div>
          <Text size="sm" c="dimmed">총 전적</Text>
          <Text size="xl" fw={700}>{stats.totalGames} 전</Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">승률</Text>
          <Text size="xl" fw={700}>{winRate}%</Text>
        </div>
        <div>
          <Text size="sm" c="dimmed">에버리지</Text>
          <Text size="xl" fw={700}>{average}</Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}

export default Statistics;