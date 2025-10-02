import React from 'react';
import { Game } from './GameList';
import { Card, Title, Text } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatsChartProps {
  games: Game[];
}

function StatsChart({ games }: StatsChartProps) {
  const chartData = games
    .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())
    .map(game => ({
      name: new Date(game.gameDate).toLocaleDateString(),
      average: game.inning > 0 ? parseFloat((game.score / game.inning).toFixed(3)) : 0,
    }));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">에버리지 변화 추이</Title>
      {games.length < 2 ? (
        <Text>차트를 표시하려면 2개 이상의 경기 기록이 필요합니다.</Text>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={['auto', 'auto']} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="average" name="에버리지" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default StatsChart;