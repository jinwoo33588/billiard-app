import React, { useMemo, useState } from 'react';
import {
  Card,
  Group,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
  Select,
  Badge,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Game } from './GameList';

type ViewMode = 'chart' | 'table';
type Metric = 'average' | 'winRate';
type Range = 'recent6' | 'recent12' | 'all';

type MonthlyRow = {
  monthKey: string; // "2025-10"
  label: string; // "2025.10"
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number | null;
  average: number | null;
};

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function toMonthKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
}
function addMonths(date: Date, delta: number) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}
function sliceByRange<T>(data: T[], range: Range) {
  if (range === 'all') return data;
  const n = range === 'recent6' ? 6 : 12;
  return data.slice(Math.max(0, data.length - n));
}

export default function UserMonthlyTrends({
  games,
  title = '월별 변화 추이',
}: {
  games: Game[];
  title?: string;
}) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [view, setView] = useState<ViewMode>('chart');
  const [metric, setMetric] = useState<Metric>('average');
  const [range, setRange] = useState<Range>('recent6');

  // ✅ 월별 집계 + ✅ 연속 월 채우기(0경기 월 포함)
  const monthlyData: MonthlyRow[] = useMemo(() => {
    if (!games || games.length === 0) return [];

    const agg = new Map<
      string,
      { games: number; wins: number; draws: number; losses: number; totalScore: number; totalInnings: number }
    >();

    let minDate: Date | null = null;
    let maxDate: Date | null = null;

    for (const g of games) {
      const d = new Date(g.gameDate);
      if (Number.isNaN(d.getTime())) continue;

      if (!minDate || d < minDate) minDate = d;
      if (!maxDate || d > maxDate) maxDate = d;

      const key = toMonthKey(d);
      if (!agg.has(key)) {
        agg.set(key, { games: 0, wins: 0, draws: 0, losses: 0, totalScore: 0, totalInnings: 0 });
      }

      const a = agg.get(key)!;
      a.games += 1;
      a.totalScore += Number(g.score) || 0;
      a.totalInnings += Number(g.inning) || 0;

      if (g.result === '승') a.wins += 1;
      else if (g.result === '무') a.draws += 1;
      else if (g.result === '패') a.losses += 1;
    }

    if (!minDate || !maxDate) return [];

    const start = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
    const end = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    const rows: MonthlyRow[] = [];
    let cursor = start;

    while (cursor <= end) {
      const key = toMonthKey(cursor);
      const [y, mm] = key.split('-');
      const label = `${y}.${mm}`;

      const a = agg.get(key);

      if (!a || a.games === 0) {
        rows.push({
          monthKey: key,
          label,
          games: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          winRate: null,
          average: null,
        });
      } else {
        const winRate = (a.wins / a.games) * 100;
        const average = a.totalInnings > 0 ? a.totalScore / a.totalInnings : 0;

        rows.push({
          monthKey: key,
          label,
          games: a.games,
          wins: a.wins,
          draws: a.draws,
          losses: a.losses,
          winRate: Number(winRate.toFixed(1)),
          average: Number(average.toFixed(3)),
        });
      }

      cursor = addMonths(cursor, 1);
    }

    return rows;
  }, [games]);

  const viewData = useMemo(() => sliceByRange(monthlyData, range), [monthlyData, range]);
  const hasEnough = viewData.length >= 2;

  // ✅ Y축 범위 고정 (요청)
  const yDomain: [number, number] = metric === 'winRate' ? [0, 100] : [0.2, 1.2];

  const metricLabel = metric === 'average' ? '에버리지' : '승률(%)';
  const strokeColor = metric === 'average' ? '#1c7ed6' : '#e8590c';
  const labelColor = '#ff6b6b';

  const lastPoint = useMemo(() => {
    for (let i = viewData.length - 1; i >= 0; i--) {
      const v = viewData[i][metric];
      if (typeof v === 'number') return { label: viewData[i].label, value: v };
    }
    return null;
  }, [viewData, metric]);

  const renderPointLabel = ({ x, y, value }: any) => {
    if (value == null || x == null || y == null) return null;
    const text = metric === 'winRate' ? Number(value).toFixed(1) : Number(value).toFixed(3);

    return (
      <text x={x} y={y - 12} textAnchor="middle" fontSize={12} fontWeight={800} fill={labelColor}>
        {text}
      </text>
    );
  };

  return (
    <Card  p={isMobile ? 'sm' : 'lg'} radius="md" withBorder>
      <Stack gap={isMobile ? 'xs' : 'md'}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Title order={4}>{title}</Title>
            <Group gap={8} mt={2}>
              <Text c="dimmed" size="sm">
                {metric === 'average' ? '월별 에버리지' : '월별 승률'}
              </Text>
              {lastPoint && (
                <Badge variant="light" size="sm">
                  최신 {lastPoint.label}:{' '}
                  {metric === 'winRate'
                    ? `${Number(lastPoint.value).toFixed(1)}%`
                    : Number(lastPoint.value).toFixed(3)}
                </Badge>
              )}
            </Group>
          </div>

          <Group gap="xs" wrap="nowrap">
            <Select
              value={range}
              onChange={(v) => setRange((v as Range) || 'recent6')}
              data={[
                { value: 'recent6', label: '최근 6개월' },
                { value: 'recent12', label: '최근 12개월' },
                { value: 'all', label: '전체' },
              ]}
              w={isMobile ? 110 : 130}
              radius="xl"
              size="sm"
            />
            <Select
              value={metric}
              onChange={(v) => setMetric((v as Metric) || 'average')}
              data={[
                { value: 'average', label: '에버' },
                { value: 'winRate', label: '승률' },
              ]}
              w={isMobile ? 90 : 110}
              radius="xl"
              size="sm"
            />
          </Group>
        </Group>

        <SegmentedControl
          value={view}
          onChange={(v) => setView(v as ViewMode)}
          data={[
            { label: '그래프', value: 'chart' },
            { label: '표', value: 'table' },
          ]}
          fullWidth={isMobile}
          size="sm"
        />

        {monthlyData.length === 0 ? (
          <Text c="dimmed" size="sm">
            월별 추이를 보려면 경기 기록이 필요합니다.
          </Text>
        ) : view === 'chart' ? (
          !hasEnough ? (
            <Text c="dimmed" size="sm">
              그래프는 최소 2개월 이상의 기록이 있어야 표시됩니다. (표에서 확인 가능)
            </Text>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 240 : 320}>
              <AreaChart data={viewData} margin={{ top: 18, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" vertical horizontal={false} />

                <XAxis
                  dataKey="label"
                  interval="preserveStartEnd"
                  minTickGap={isMobile ? 26 : 18}
                  angle={isMobile ? -35 : 0}
                  textAnchor={isMobile ? 'end' : 'middle'}
                  height={isMobile ? 52 : 30}
                  tickMargin={10}
                  tick={{ fontSize: isMobile ? 11 : 12 }}
                />

                <YAxis domain={yDomain as any} tick={false} axisLine={false} />

                <defs>
                  <linearGradient id="trendFillUMT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={strokeColor} stopOpacity={0.18} />
                    <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <Tooltip
                  contentStyle={{ borderRadius: 12 }}
                  formatter={(value: any) => {
                    if (value === null || value === undefined) return ['-', metricLabel];
                    if (metric === 'winRate') return [`${Number(value).toFixed(1)}%`, metricLabel];
                    return [Number(value).toFixed(3), metricLabel];
                  }}
                />

                {!isMobile && <Legend />}

                <Area
                  dataKey={metric}
                  type="monotone"
                  fill="url(#trendFillUMT)"
                  stroke="none"
                  connectNulls={true}
                />

                <Line
                  dataKey={metric}
                  type="monotone"
                  stroke={strokeColor}
                  strokeWidth={3}
                  dot={{ r: 5, fill: 'white', stroke: strokeColor, strokeWidth: 2 }}
                  activeDot={{ r: 9, fill: 'white', stroke: strokeColor, strokeWidth: 4 }}
                  connectNulls={true}
                  label={renderPointLabel}
                />
              </AreaChart>
            </ResponsiveContainer>
          )
        ) : (
          // ✅ 표: 모바일은 3컬럼로 "스크롤 없이" 꽉 차게
          isMobile ? (
            <Table
              striped
              highlightOnHover
              withTableBorder
              horizontalSpacing="xs"
              verticalSpacing="xs"
              
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>월</Table.Th>
                  <Table.Th ta="right">승률</Table.Th>
                  <Table.Th ta="right">에버</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {viewData.map((row) => (
                  <Table.Tr key={row.monthKey}>
                    <Table.Td>{row.label}</Table.Td>
                    <Table.Td ta="right">{row.winRate === null ? '-' : `${row.winRate.toFixed(1)}%`}</Table.Td>
                    <Table.Td ta="right">{row.average === null ? '-' : row.average.toFixed(3)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          ) : (
            <Table striped highlightOnHover withTableBorder horizontalSpacing="sm" verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>월</Table.Th>
                  <Table.Th>경기수</Table.Th>
                  <Table.Th>전적</Table.Th>
                  <Table.Th>승률</Table.Th>
                  <Table.Th>에버</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {viewData.map((row) => (
                  <Table.Tr key={row.monthKey}>
                    <Table.Td>{row.label}</Table.Td>
                    <Table.Td>{row.games}</Table.Td>
                    <Table.Td>
                      {row.wins}승 {row.draws}무 {row.losses}패
                    </Table.Td>
                    <Table.Td>{row.winRate === null ? '-' : `${row.winRate.toFixed(1)}%`}</Table.Td>
                    <Table.Td>{row.average === null ? '-' : row.average.toFixed(3)}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          )
        )}

        <Text c="dimmed" size="xs">
          * 승률 Y축은 0~100, 에버리지 Y축은 0.2~1.2로 고정했습니다.
        </Text>
      </Stack>
    </Card>
  );
}