import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import GameForm from '../components/GameForm';
import GameList, { Game } from '../components/GameList';
import Statistics from '../components/Statistics';
import { Stack, Container, Tabs, Table, Text, UnstyledButton, Group, Center, rem } from '@mantine/core';
import { IconSelector, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import axiosInstance from '../api/axiosInstance';

interface DashboardPageProps {
  games: Game[];
  refreshGames: () => void;
}

interface RankItem {
  userId: string;
  nickname: string;
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  average: number;
  winRate: number;
}

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

function DashboardPage({ games, refreshGames }: DashboardPageProps) {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<keyof RankItem | null>('average');
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const fetchRanking = async () => {
    try {
      const response = await axiosInstance.get('/users/ranking');
      setRanking(response.data);
    } catch (error) {
      console.error('랭킹 정보를 불러오는 데 실패했습니다.', error);
    }
  };

  const handleUserRowClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  const setSorting = (field: keyof RankItem) => {
    const reversed = field === sortBy && !reverseSortDirection;
    setReverseSortDirection(reversed);
    setSortBy(field);
  };

  const sortedData = useMemo(() => {
    if (!sortBy) return ranking;
    return [...ranking].sort((a, b) => {
      if (reverseSortDirection) {
        return a[sortBy] < b[sortBy] ? -1 : 1;
      }
      return b[sortBy] < a[sortBy] ? -1 : 1;
    });
  }, [ranking, sortBy, reverseSortDirection]);

  const rankingRows = sortedData.map((item, index) => (
    <Table.Tr key={item.userId} onClick={() => handleUserRowClick(item.userId)} style={{ cursor: 'pointer' }}>
      <Table.Td>{index + 1}</Table.Td>
      <Table.Td>{item.nickname}</Table.Td>
      <Table.Td>{`${item.totalGames}전 ${item.wins}승 ${item.draws}무 ${item.losses}패`}</Table.Td>
      <Table.Td>{(item.average || 0).toFixed(3)}</Table.Td>
      <Table.Td>{(item.winRate || 0).toFixed(1)}%</Table.Td>
    </Table.Tr>
  ));

  return (
    <Container size="lg">
      <Tabs defaultValue="my-records">
        <Tabs.List grow>
          <Tabs.Tab value="my-records">내 기록</Tabs.Tab>
          <Tabs.Tab value="ranking" onClick={fetchRanking}>전체 랭킹</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="my-records" pt="md">
          <Stack gap="xl">
            <Statistics games={games} />
            <GameForm onGameAdded={refreshGames} />
            <GameList games={games} onListChange={refreshGames} />
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="ranking" pt="md">
          {ranking.length === 0 ? (
            <Text>랭킹 데이터가 없습니다.</Text>
          ) : (
            <Table striped highlightOnHover withTableBorder>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>순위</Table.Th>
                  <Table.Th>닉네임</Table.Th>
                  <Table.Th>총 전적</Table.Th>
                  <Th sorted={sortBy === 'average'} reversed={reverseSortDirection} onSort={() => setSorting('average')}>
                    에버리지
                  </Th>
                  <Th sorted={sortBy === 'winRate'} reversed={reverseSortDirection} onSort={() => setSorting('winRate')}>
                    승률
                  </Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rankingRows}</Table.Tbody>
            </Table>
          )}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}

export default DashboardPage;