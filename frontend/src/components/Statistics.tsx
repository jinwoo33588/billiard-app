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
      // [수정] 한글 결과값을 기준으로 계산
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
          <Text size="sm" c="dimmed">총 전적</Text>
          {/* [수정] 표시 형식 변경 */}
          <Text size="xl" fw={700}>
            {`${stats.totalGames}전 ${stats.wins}승 ${stats.draws}무 ${stats.losses}패`}
          </Text>
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