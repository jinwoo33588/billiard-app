import React, { useState, useMemo, useEffect } from 'react';
import { Title, Stack, Card, Text, SimpleGrid, Table, UnstyledButton, Group, Center, rem, SegmentedControl, Box } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { Game } from '../components/GameList';
import StatsChart from '../components/StatsChart';
import { IconSelector, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

interface ArchivePageProps {
  games: Game[];
}

// 테이블 헤더를 위한 인터페이스와 컴포넌트 (데스크탑용)
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
          <Text fw={500} fz="sm">{children}</Text>
          <Center><Icon style={{ width: rem(16), height: rem(16) }} /></Center>
        </Group>
      </UnstyledButton>
    </Table.Th>
  );
}

function ArchivePage({ games }: ArchivePageProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [quickFilter, setQuickFilter] = useState<string>('all');

  useEffect(() => {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    if (quickFilter === 'week') {
      const dayOfWeek = startOfToday.getDay();
      const startDate = new Date(startOfToday);
      startDate.setDate(startOfToday.getDate() - dayOfWeek);
      setDateRange([startDate, new Date()]);
    } else if (quickFilter === 'month') {
      const startDate = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1);
      setDateRange([startDate, new Date()]);
    } else if (quickFilter === 'all') {
      setDateRange([null, null]);
    }
  }, [quickFilter]);
  
  const filteredGames = useMemo(() => {
    const [startDate, endDate] = dateRange;
    if (!startDate && !endDate) {
      return games;
    }
    const effectiveStartDate = startDate || new Date(0); 
    const effectiveEndDate = endDate || startDate;
    const adjustedEndDate = new Date(effectiveEndDate!);
    adjustedEndDate.setHours(23, 59, 59, 999);

    return games.filter(game => {
      const gameDate = new Date(game.gameDate);
      return gameDate >= effectiveStartDate && gameDate <= adjustedEndDate;
    });
  }, [games, dateRange]);
  
  const stats = filteredGames.reduce(
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
      let aValue = a[sortBy];
      let bValue = b[sortBy];
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
      <Table.Td>{new Date(game.gameDate).toLocaleDateString()}</Table.Td>
      <Table.Td>{game.gameType}</Table.Td>
      <Table.Td>{game.result}</Table.Td>
      <Table.Td>{game.score}</Table.Td>
      <Table.Td>{game.inning}</Table.Td>
      <Table.Td>{game.inning > 0 ? (game.score / game.inning).toFixed(3) : 'N/A'}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Stack gap="xl">
      <Title order={2}>기록 보관함</Title>
      
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Stack>
          <DatePickerInput
            type="range"
            label="기간 직접 선택"
            placeholder="분석할 기간 선택"
            value={dateRange}
            // [수정] onChange의 value 타입을 명시적으로 지정하여 에러 해결
            onChange={(value: [Date | null, Date | null]) => {
              setDateRange(value);
              setQuickFilter('');
            }}
            clearable
          />
          <SegmentedControl
            data={[{ label: '이번 주', value: 'week' }, { label: '이번 달', value: 'month' }, { label: '전체', value: 'all'}]}
            value={quickFilter}
            onChange={setQuickFilter}
            fullWidth
          />
        </Stack>
      </Card>

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} mb="md">선택 기간 통계</Title>
        <SimpleGrid cols={{ base: 2, xs: 3 }}>
          <div><Text size="xs" c="dimmed" ta="center">총 전적</Text><Text size="lg" fw={700} ta="center">{`${stats.totalGames}전 ${stats.wins}승 ${stats.draws}무 ${stats.losses}패`}</Text></div>
          <div><Text size="xs" c="dimmed" ta="center">승률</Text><Text size="lg" fw={700} ta="center">{winRate}%</Text></div>
          <div><Text size="xs" c="dimmed" ta="center">에버리지</Text><Text size="lg" fw={700} ta="center">{average}</Text></div>
        </SimpleGrid>
      </Card>
      
      <StatsChart games={filteredGames} />

      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} mb="md">상세 기록</Title>
        {isDesktop ? (
          <Table.ScrollContainer minWidth={600}>
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Th sorted={sortBy === 'gameDate'} reversed={reverseSortDirection} onSort={() => setSorting('gameDate')}>날짜</Th>
                  <Th sorted={sortBy === 'gameType'} reversed={reverseSortDirection} onSort={() => setSorting('gameType')}>방식</Th>
                  <Th sorted={sortBy === 'result'} reversed={reverseSortDirection} onSort={() => setSorting('result')}>결과</Th>
                  <Th sorted={sortBy === 'score'} reversed={reverseSortDirection} onSort={() => setSorting('score')}>점수</Th>
                  <Th sorted={sortBy === 'inning'} reversed={reverseSortDirection} onSort={() => setSorting('inning')}>이닝</Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{desktopRows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : (
          <Stack>
            {filteredGames.length > 0 ? (
              filteredGames.sort((a, b) => new Date(b.gameDate).getTime() - new Date(a.gameDate).getTime())
              .map(game => (
                <Card key={game._id} withBorder p="sm" radius="md">
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>{new Date(game.gameDate).toLocaleDateString()}</Text>
                      <Text size="xs" c="dimmed">{game.gameType}</Text>
                    </div>
                    <Text size="xl" fw={700}>{game.result}</Text>
                  </Group>
                  <Group grow mt="xs">
                    <Text size="sm">이닝: {game.inning}</Text>
                    <Text size="sm">점수: {game.score}</Text>
                    <Text size="sm">Avg: {game.inning > 0 ? (game.score / game.inning).toFixed(3) : 'N/A'}</Text>
                  </Group>
                </Card>
              ))
            ) : (
              <Text c="dimmed" ta="center">해당 기간의 기록이 없습니다.</Text>
            )}
          </Stack>
        )}
      </Card>
    </Stack>
  );
}

export default ArchivePage;