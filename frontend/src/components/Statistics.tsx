// frontend/src/components/Statistics.tsx

import React from 'react';
import { Game } from './GameList';
import { Card, Title, Text, SimpleGrid, Group } from '@mantine/core'; // [수정] Group 추가

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
      else if (game.result === '무') acc.draws += 1;
      else if (game.result === '패') acc.losses += 1;
      return acc;
    },
    { totalGames: 0, wins: 0, draws: 0, losses: 0, totalScore: 0, totalInnings: 0 }
  );

  const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : '0.0';
  const average = stats.totalInnings > 0 ? (stats.totalScore / stats.totalInnings).toFixed(3) : '0.000';

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">종합 통계</Title>
      <SimpleGrid cols={3} spacing="lg">
        <div>
          <Text size="xs" c="dimmed" ta="center">총 전적</Text>
          {/* [수정] Group과 Text를 사용하여 승, 무, 패를 각각 다른 색으로 표시 */}
          <Group gap="xs" justify="center" mt={4}>
            <Text size="lg" fw={700} c="blue">{stats.wins}승</Text>
            <Text size="lg" fw={700} c="gray">{stats.draws}무</Text>
            <Text size="lg" fw={700} c="red">{stats.losses}패</Text>
          </Group>
        </div>
        <div>
          <Text size="xs" c="dimmed" ta="center">승률</Text>
          <Text size="lg" fw={700} ta="center">{winRate}%</Text>
        </div>
        <div>
          <Text size="xs" c="dimmed" ta="center">에버리지</Text>
          <Text size="lg" fw={700} ta="center">{average}</Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}

export default Statistics;