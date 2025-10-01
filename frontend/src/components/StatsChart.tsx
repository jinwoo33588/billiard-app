import React from 'react';
import { Game } from './GameList';
import { Card, Title, Text } from '@mantine/core';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StatsChartProps {
  games: Game[];
}

function StatsChart({ games }: StatsChartProps) {
  // 1. 차트에 맞는 형식으로 데이터를 가공합니다.
  const chartData = games
    // 날짜가 오래된 순으로 정렬해야 라인 차트가 올바르게 그려집니다.
    .sort((a, b) => new Date(a.gameDate).getTime() - new Date(b.gameDate).getTime())
    .map(game => ({
      // X축에 표시될 이름 (날짜)
      name: new Date(game.gameDate).toLocaleDateString(),
      // Y축에 표시될 값 (해당 경기의 에버리지)
      average: game.inning > 0 ? parseFloat((game.score / game.inning).toFixed(3)) : 0,
    }));

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">에버리지 변화 추이</Title>
      {games.length < 2 ? (
        <Text>차트를 표시하려면 2개 이상의 경기 기록이 필요합니다.</Text>
      ) : (
        // 2. ResponsiveContainer로 차트가 부모 요소의 크기에 맞게 조절되도록 합니다.
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="average" stroke="#8884d8" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

export default StatsChart;