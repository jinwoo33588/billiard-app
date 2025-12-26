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

  // [추가] Y축 범위를 동적으로 계산하는 로직
  const getAxisDomain = () => {
    if (chartData.length < 2) {
      return [0, 1]; // 데이터가 부족할 경우 기본 범위
    }

    const averages = chartData.map(item => item.average);
    let dataMin = Math.min(...averages);
    let dataMax = Math.max(...averages);

    // 데이터의 변동폭이 너무 작을 경우, Y축 범위를 인위적으로 넓혀줍니다.
    const range = dataMax - dataMin;
    const minRange = 0.3; // Y축의 최소 높이를 0.3으로 설정

    if (range < minRange) {
      const midPoint = (dataMax + dataMin) / 2;
      dataMin = midPoint - minRange / 2;
      dataMax = midPoint + minRange / 2;
    } else {
      // 변동폭이 충분할 경우, 위아래로 약간의 여백만 줍니다.
      const padding = range * 0.1;
      dataMin -= padding;
      dataMax += padding;
    }

    // 최소값은 0보다 작아지지 않도록 합니다.
    const finalMin = Math.max(0, dataMin);

    // toFixed를 사용해 소수점 정리를 해줍니다.
    return [parseFloat(finalMin.toFixed(2)), parseFloat(dataMax.toFixed(2))];
  };

  const yAxisDomain = getAxisDomain();

  return (
    <Card  p="sm" radius="md" withBorder>
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
            {/* [수정] YAxis에 동적으로 계산된 domain을 적용합니다. */}
            <YAxis domain={yAxisDomain} />
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