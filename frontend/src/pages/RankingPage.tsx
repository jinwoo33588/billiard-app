import React, { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Card, Title, Text, Center, Loader, Stack, UnstyledButton, Group, rem, SegmentedControl, ActionIcon, Container } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowUp, IconArrowDown } from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';

// [수정] RankItem 인터페이스에 handicap 추가
interface RankItem {
  userId: string;
  nickname: string;
  handicap: number;
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  average: number;
  winRate: number;
}

function RankingPage() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const [sortBy, setSortBy] = useState<keyof RankItem>('average');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/users/ranking');
        setRanking(response.data);
      } catch (error) {
        console.error('랭킹 정보를 불러오는 데 실패했습니다.', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);
  
  const sortedData = useMemo(() => {
    return [...ranking].sort((a, b) => {
      if (sortDirection === 'asc') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      }
      return b[sortBy] > a[sortBy] ? 1 : -1;
    });
  }, [ranking, sortBy, sortDirection]);

  const handleSortChange = (value: string) => {
    if (value === 'average' || value === 'winRate' || value === 'handicap') {
      setSortBy(value as keyof RankItem);
      setSortDirection('desc');
    }
  };

  const toggleSortDirection = () => {
    setSortDirection((current) => (current === 'desc' ? 'asc' : 'desc'));
  };

  if (loading) {
    return <Center><Loader /></Center>;
  }

  return (
    <Container fluid px="sm" py={0}>
    <Stack gap="sm">
    <Title order={3} ta="center">🏆 전체 랭킹</Title>

    <Group justify="center" gap="xs" wrap="wrap">
        <SegmentedControl
          size='sm'
          value={sortBy}
          onChange={handleSortChange}
          data={[
            { label: '에버리지 순', value: 'average' },
            { label: '승률 순', value: 'winRate' },
            { label: '핸디 순', value: 'handicap' },
          ]}
        />
        <ActionIcon variant="default" size="md" onClick={toggleSortDirection}>
          {sortDirection === 'desc' ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />}
        </ActionIcon>
      </Group>

      {sortedData.length === 0 ? (
        <Text ta="center" mt="md">랭킹 데이터가 없습니다.</Text>
      ) : (
        <Stack mt="sm" gap="sm">
          {sortedData.map((item, index) => (
            <UnstyledButton key={item.userId} onClick={() => navigate(`/users/${item.userId}`)}>
              <Card  p="sm" radius="sm" withBorder>
                <Group justify="space-between">
                  <Group>
                    <Title order={4} c={index < 3 ? 'blue' : 'gray'}>#{index + 1}</Title>
                    <div>
                      {/* [수정] 닉네임 옆에 핸디캡 점수 표시 */}
                      <Text fw={700}>{item.nickname} ({item.handicap}점)</Text>
                      <Text size="xs" c="dimmed">
                        {`${item.totalGames}전 ${item.wins}승 ${item.draws}무 ${item.losses}패`}
                      </Text>
                    </div>
                  </Group>

                  <Group gap="xs">
                    <div>
                      <Text size="xs" c="dimmed" ta="right">승률</Text>
                      <Text fw={500} ta="right">{(item.winRate || 0).toFixed(1)}%</Text>
                    </div>
                    <div>
                      <Text size="xs" c="dimmed" ta="right">에버리지</Text>
                      <Text fw={500} ta="right">{(item.average || 0).toFixed(3)}</Text>
                    </div>
                  </Group>
                </Group>
              </Card>
            </UnstyledButton>
          ))}
        </Stack>
      )}
    </Stack>
    </Container>
  );
}

export default RankingPage;