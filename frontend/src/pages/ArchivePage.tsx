import React, { useState, useMemo, useEffect } from 'react';
import {
  Title,
  Stack,
  Card,
  Text,
  SimpleGrid,
  Table,
  UnstyledButton,
  Group,
  Center,
  rem,
  Container,
  Button,
  Divider,
  Badge,
} from '@mantine/core';
import { DatePickerInput, DatesRangeValue } from '@mantine/dates';
import { Game } from '../components/GameList';
import { IconSelector, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

interface ArchivePageProps {
  games: Game[];
}

// 테이블 헤더 (데스크탑용)
interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}
function Th({ children, reversed, sorted, onSort }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector;
  return (
    <Table.Th>
      <UnstyledButton onClick={onSort}>
        <Group justify="space-between">
          <Text fw={500} fz="sm">
            {children}
          </Text>
          <Center>
            <Icon style={{ width: rem(16), height: rem(16) }} />
          </Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

type FilterMode = 'all' | 'custom' | 'yearMonth';

function computeStats(list: Game[]) {
  const s = list.reduce(
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

  const winRate = s.totalGames > 0 ? ((s.wins / s.totalGames) * 100).toFixed(1) : '0.0';
  const average = s.totalInnings > 0 ? (s.totalScore / s.totalInnings).toFixed(3) : '0.000';

  return { ...s, winRate, average };
}

export default function ArchivePage({ games }: ArchivePageProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // ✅ 기간 필터 (중요: Mantine 타입이 string range로 잡혀있어서 여기도 string으로 맞춤)
  const [dateRange, setDateRange] = useState<DatesRangeValue<string>>([null, null]);
  const [filterMode, setFilterMode] = useState<FilterMode>('all');

  // ✅ 연/월 선택
  const years = useMemo(() => {
    const ys = Array.from(new Set(games.map((g) => new Date(g.gameDate).getFullYear()))).sort((a, b) => b - a);
    return ys.filter((y) => Number.isFinite(y));
  }, [games]);

  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const monthsInYear = useMemo(() => {
    if (selectedYear === null) return [];
    const set = new Set<number>();
    for (const g of games) {
      const d = new Date(g.gameDate);
      if (d.getFullYear() === selectedYear) set.add(d.getMonth());
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [games, selectedYear]);

  const monthCounts = useMemo(() => {
    const map = new Map<number, number>();
    if (selectedYear === null) return map;
    for (const g of games) {
      const d = new Date(g.gameDate);
      if (d.getFullYear() !== selectedYear) continue;
      const m = d.getMonth();
      map.set(m, (map.get(m) || 0) + 1);
    }
    return map;
  }, [games, selectedYear]);

  // ✅ 연/월 선택이 바뀌면 dateRange 자동 세팅 (string으로 저장)
  useEffect(() => {
    if (filterMode !== 'yearMonth') return;

    if (selectedYear === null) {
      setDateRange([null, null]);
      return;
    }

    // 연도 전체
    if (selectedMonth === null) {
      const start = new Date(selectedYear, 0, 1);
      const end = new Date(selectedYear, 11, 31);
      end.setHours(23, 59, 59, 999);
      setDateRange([start.toISOString(), end.toISOString()]);
      return;
    }

    // 특정 월
    const start = new Date(selectedYear, selectedMonth, 1);
    const end = new Date(selectedYear, selectedMonth + 1, 0);
    end.setHours(23, 59, 59, 999);
    setDateRange([start.toISOString(), end.toISOString()]);
  }, [filterMode, selectedYear, selectedMonth]);

  // ✅ 필터된 게임 (여기서만 string → Date 변환해서 사용)
  const filteredGames = useMemo(() => {
    const [startStr, endStr] = dateRange;

    if (!startStr && !endStr) return games;

    const startDate = startStr ? new Date(startStr) : new Date(0);
    const endDateBase = endStr ? new Date(endStr) : startStr ? new Date(startStr) : new Date();
    const endDate = new Date(endDateBase);
    endDate.setHours(23, 59, 59, 999);

    return games.filter((game) => {
      const gd = new Date(game.gameDate);
      return gd >= startDate && gd <= endDate;
    });
  }, [games, dateRange]);

  const stats = useMemo(() => computeStats(filteredGames), [filteredGames]);

  const isMonthSelected = filterMode === 'yearMonth' && selectedYear !== null && selectedMonth !== null;
  const monthSummary = useMemo(() => {
    if (!isMonthSelected) return null;
    return computeStats(filteredGames);
  }, [isMonthSelected, filteredGames]);

  // ✅ 정렬
  const [sortBy, setSortBy] = useState<keyof Game | null>('gameDate');
  const [reverseSortDirection, setReverseSortDirection] = useState(true);

  const setSorting = (field: keyof Game) => {
    const reversed = field === sortBy && !reverseSortDirection;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return filteredGames;
    return [...filteredGames].sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'gameDate') {
        aValue = new Date(a.gameDate).getTime();
        bValue = new Date(b.gameDate).getTime();
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return reverseSortDirection ? aValue - bValue : bValue - aValue;
      }
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return reverseSortDirection ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      return 0;
    });
  }, [filteredGames, sortBy, reverseSortDirection]);

  const desktopRows = sortedData.map((game) => (
    <Table.Tr key={game._id}>
      <Table.Td>{new Date(game.gameDate).toLocaleDateString('ko-KR')}</Table.Td>
      <Table.Td>{game.gameType}</Table.Td>
      <Table.Td>{game.result}</Table.Td>
      <Table.Td>{game.score}</Table.Td>
      <Table.Td>{game.inning}</Table.Td>
      <Table.Td>{game.inning > 0 ? (game.score / game.inning).toFixed(3) : 'N/A'}</Table.Td>
    </Table.Tr>
  ));

  const pillVariant = (active: boolean) => (active ? 'filled' : 'light');

  const clearAllFilters = () => {
    setDateRange([null, null]);
    setFilterMode('all');
    setSelectedYear(null);
    setSelectedMonth(null);
  };

  return (
    <Container fluid px="sm" py="sm">
      <Stack gap="sm" align="stretch">
        <Title order={2}>기록 보관함</Title>

        {/* ✅ 필터 카드 */}
        <Card p="sm" radius="md" withBorder>
          <Stack gap="md">
            <DatePickerInput
              type="range"
              label="기간 직접 선택"
              placeholder="분석할 기간 선택"
              value={dateRange}
              locale="ko"
              valueFormat="YYYY년 M월 D일"
              onChange={(value) => {
                setDateRange(value);
                setFilterMode(value[0] || value[1] ? 'custom' : 'all');
                setSelectedYear(null);
                setSelectedMonth(null);
              }}
              clearable
            />

            <Group justify="space-between" gap="xs" wrap="wrap">
              <Group gap="xs" wrap="wrap">
                <Button
                  size="xs"
                  radius="xl"
                  variant={pillVariant(filterMode === 'all' && selectedYear === null)}
                  onClick={() => {
                    setSelectedYear(null);
                    setSelectedMonth(null);
                    setDateRange([null, null]);
                    setFilterMode('all');
                  }}
                >
                  전체
                </Button>

                {years.map((y) => (
                  <Button
                    key={y}
                    size="xs"
                    radius="xl"
                    variant={pillVariant(selectedYear === y && filterMode === 'yearMonth')}
                    onClick={() => {
                      setSelectedYear(y);
                      setSelectedMonth(null);
                      setFilterMode('yearMonth');
                    }}
                  >
                    {y}
                  </Button>
                ))}
              </Group>

              <Button variant="subtle" size="xs" onClick={clearAllFilters}>
                필터 초기화
              </Button>
            </Group>

            {selectedYear !== null && (
              <Group gap="xs" wrap="wrap">
                <Button
                  size="xs"
                  radius="xl"
                  variant={pillVariant(selectedMonth === null && filterMode === 'yearMonth')}
                  onClick={() => {
                    setSelectedMonth(null);
                    setFilterMode('yearMonth');
                  }}
                  disabled={monthsInYear.length === 0}
                >
                  {selectedYear} 전체
                </Button>

                {monthsInYear.length === 0 ? (
                  <Text c="dimmed" size="sm">
                    선택한 연도에 기록이 없습니다.
                  </Text>
                ) : (
                  monthsInYear.map((m) => {
                    const count = monthCounts.get(m) || 0;
                    const active = selectedMonth === m && filterMode === 'yearMonth';

                    return (
                      <Button
                        key={m}
                        size="xs"
                        radius="xl"
                        variant={pillVariant(active)}
                        onClick={() => {
                          setSelectedMonth(m);
                          setFilterMode('yearMonth');
                        }}
                        rightSection={
                          <Badge size="xs" variant={active ? 'filled' : 'light'}>
                            {count}
                          </Badge>
                        }
                      >
                        {m + 1}월
                      </Button>
                    );
                  })
                )}
              </Group>
            )}

            <Text c="dimmed" size="xs">
              * 기간 직접 선택을 하면 pill 필터보다 우선 적용됩니다. (연도/월을 다시 누르면 pill 기준으로 전환)
            </Text>
          </Stack>
        </Card>

        {/* ✅ 선택 기간 통계 */}
        <Stack p="sm">
          <Title order={3} mb="md">선택 기간 통계</Title>
          <Card p="sm" radius="md" withBorder>
            <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
              <div>
                <Text size="xs" c="dimmed" ta="center">총 게임 수</Text>
                <Text size="lg" fw={700} ta="center">{stats.totalGames}판</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" ta="center">총 전적</Text>
                <Text size="lg" fw={700} ta="center">
                  {stats.wins}승 {stats.draws}무 {stats.losses}패
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" ta="center">승률</Text>
                <Text size="lg" fw={700} ta="center">{stats.winRate}%</Text>
              </div>
              <div>
                <Text size="xs" c="dimmed" ta="center">에버리지</Text>
                <Text size="lg" fw={700} ta="center">{stats.average}</Text>
              </div>
            </SimpleGrid>
          </Card>
        </Stack>

        {/* ✅ 상세 기록 */}
        <Stack p="sm">
          <Title order={3} mb="md">상세 기록</Title>

          {isDesktop ? (
            <Table.ScrollContainer minWidth={650}>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Th sorted={sortBy === 'gameDate'} reversed={reverseSortDirection} onSort={() => setSorting('gameDate')}>
                      날짜
                    </Th>
                    <Th sorted={sortBy === 'gameType'} reversed={reverseSortDirection} onSort={() => setSorting('gameType')}>
                      방식
                    </Th>
                    <Th sorted={sortBy === 'result'} reversed={reverseSortDirection} onSort={() => setSorting('result')}>
                      결과
                    </Th>
                    <Th sorted={sortBy === 'score'} reversed={reverseSortDirection} onSort={() => setSorting('score')}>
                      점수
                    </Th>
                    <Th sorted={sortBy === 'inning'} reversed={reverseSortDirection} onSort={() => setSorting('inning')}>
                      이닝
                    </Th>
                    <Table.Th>에버</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{desktopRows}</Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          ) : (
            <Stack>
              {filteredGames.length > 0 ? (
                [...filteredGames]
                  .sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
                  .map((game) => (
                    <Card key={game._id} withBorder p="sm" radius="md">
                      <Group justify="space-between" align="flex-start">
                        <div>
                          <Text fw={600}>{new Date(game.gameDate).toLocaleDateString('ko-KR')}</Text>
                          <Text size="xs" c="dimmed">{game.gameType}</Text>
                        </div>
                        <Text size="xl" fw={800}>{game.result}</Text>
                      </Group>

                      <Group grow mt="xs">
                        <Text size="sm">이닝: {game.inning}</Text>
                        <Text size="sm">점수: {game.score}</Text>
                        <Text size="sm">
                          Avg: {game.inning > 0 ? (game.score / game.inning).toFixed(3) : 'N/A'}
                        </Text>
                      </Group>
                    </Card>
                  ))
              ) : (
                <Text c="dimmed" ta="center">
                  해당 기간의 기록이 없습니다.
                </Text>
              )}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}