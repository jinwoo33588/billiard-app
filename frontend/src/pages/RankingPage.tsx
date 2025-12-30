import React, { useState, useEffect, useMemo, useRef } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  Card,
  Title,
  Text,
  Center,
  Loader,
  Stack,
  UnstyledButton,
  Group,
  SegmentedControl,
  ActionIcon,
  Badge,
  Button,
} from '@mantine/core';
import { MonthPickerInput } from '@mantine/dates';
import { useNavigate } from 'react-router-dom';
import { IconArrowUp, IconArrowDown, IconTarget } from '@tabler/icons-react';

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

type MeProfile = {
  _id: string;
  nickname: string;
  handicap: number;
};

function getUserIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.userId ?? null; // ✅ 백엔드: jwt.sign({ userId: user._id }, ...)
  } catch {
    return null;
  }
}

function RankingPage() {
  const [ranking, setRanking] = useState<RankItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const myUserId = token ? getUserIdFromToken(token) : null;

  // ✅ 내 프로필(진짜 닉/핸디)
  const [meProfile, setMeProfile] = useState<MeProfile | null>(null);

  // ✅ 전체/월별
  const [mode, setMode] = useState<'all' | 'month'>('all');

  // ✅ MonthPickerInput 타입(string)
  const [monthValue, setMonthValue] = useState<string | null>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${mm}`;
  });

  const [sortBy, setSortBy] = useState<keyof RankItem>('average');
  const [sortDirection, setSortDirection] = useState<'desc' | 'asc'>('desc');

  const myRef = useRef<HTMLDivElement | null>(null);

  // ✅ 1) 내 프로필 가져오기 (/users/me)
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setMeProfile(null);
        return;
      }
      try {
        const res = await axiosInstance.get('/users/me'); // authMiddleware 필요 (axiosInstance가 토큰 자동첨부 전제)
        setMeProfile(res.data);
      } catch (e) {
        console.error('내 프로필(/users/me) 조회 실패:', e);
        setMeProfile(null);
      }
    };
    fetchMe();
  }, [token]);

  // ✅ 2) 랭킹 가져오기
  const fetchRanking = async () => {
    try {
      setLoading(true);

      const params: any = {};
      if (mode === 'month' && monthValue) {
        const [y, m] = monthValue.split('-');
        params.year = Number(y);
        params.month = Number(m);
      }

      const response = await axiosInstance.get('/users/ranking', { params });
      setRanking(response.data);
    } catch (error) {
      console.error('랭킹 정보를 불러오는 데 실패했습니다.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, monthValue]);

  const sortedData = useMemo(() => {
    return [...ranking].sort((a, b) => {
      const av = Number(a[sortBy] as any);
      const bv = Number(b[sortBy] as any);
      if (sortDirection === 'asc') return av > bv ? 1 : -1;
      return bv > av ? 1 : -1;
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

  const titleText =
    mode === 'all'
      ? '🏆 전체 랭킹'
      : monthValue
        ? (() => {
            const [y, m] = monthValue.split('-');
            return `🏆 ${y}년 ${Number(m)}월 랭킹`;
          })()
        : '🏆 월별 랭킹';

  // ✅ 내 순위/내 데이터
  const myIndex = useMemo(() => {
    if (!myUserId) return -1;
    return sortedData.findIndex((x) => String(x.userId) === String(myUserId));
  }, [sortedData, myUserId]);

  const me = myIndex >= 0 ? sortedData[myIndex] : null;

  // ✅ 월별 0전 등으로 랭킹에 내 데이터가 없을 때: 진짜 닉/핸디로 myGhost 생성
  const myGhost: RankItem | null = useMemo(() => {
    if (!myUserId) return null;
    if (me) return null;
    if (!meProfile) return null; // ✅ 진짜 닉/핸디를 가져온 경우에만 생성

    return {
      userId: myUserId,
      nickname: meProfile.nickname,
      handicap: meProfile.handicap,
      totalGames: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      average: 0,
      winRate: 0,
    };
  }, [myUserId, me, meProfile]);

  // ✅ 렌더링 리스트: 내 카드가 없으면 맨 아래에 myGhost 붙이기
  const renderList = useMemo(() => {
    if (!myGhost) return sortedData;
    return [...sortedData, myGhost];
  }, [sortedData, myGhost]);

  // ✅ 내 순위 라벨
  const myRankLabel =
    me ? `#${myIndex + 1} / ${sortedData.length}` : '이번 달 순위 없음 (0전)';

  if (loading) return <Center><Loader /></Center>;

  return (
    <Stack gap="sm">
      <Title order={2} ta="center">{titleText}</Title>

      {/* 상단: 전체/월별 토글 + 월 선택 */}
      <Stack gap="xs" px="xs">
        <SegmentedControl
          value={mode}
          onChange={(v) => setMode(v as 'all' | 'month')}
          fullWidth
          data={[
            { label: '전체', value: 'all' },
            { label: '월별', value: 'month' },
          ]}
        />

        {mode === 'month' && (
          <MonthPickerInput
            value={monthValue}
            onChange={setMonthValue}
            placeholder="월 선택"
            clearable={false}
          />
        )}
      </Stack>

      {/* ✅ 내 요약 카드 (me 또는 myGhost 있을 때 항상 표시) */}
      <Stack gap="xs" px="xs">
        {(myUserId && (me || myGhost)) ? (
          <Card
            withBorder
            radius="md"
            p="md"
            style={{
              position: 'sticky',
              top: 8,
              zIndex: 10,
              background: 'white',
            }}
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Group gap={8}>
                  <Badge variant="filled">ME</Badge>
                  <Text size="xs" c="dimmed">내 순위</Text>
                </Group>

                <Text fw={900} style={{ fontSize: 18 }}>
                  {myRankLabel}
                </Text>

                <Text size="sm" fw={800}>
                  {(me ?? myGhost)!.nickname} ({(me ?? myGhost)!.handicap}점)
                </Text>

                {!me && (
                  <Text size="xs" c="dimmed" mt={4}>
                    이번 달 기록이 없어서 랭킹에 집계되지 않았어요.
                  </Text>
                )}
              </div>

              <Group gap="xl">
                <div>
                  <Text size="xs" c="dimmed" ta="right">승률</Text>
                  <Text fw={800} ta="right">{((me ?? myGhost)!.winRate || 0).toFixed(1)}%</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed" ta="right">에버리지</Text>
                  <Text fw={800} ta="right">{((me ?? myGhost)!.average || 0).toFixed(3)}</Text>
                </div>
              </Group>
            </Group>

            <Group justify="flex-end" mt="sm">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconTarget size={16} />}
                onClick={() => myRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              >
                내 위치로
              </Button>
            </Group>
          </Card>
        ) : (
          <Card withBorder radius="md" p="md">
            <Text size="sm" c="dimmed">
              {token
                ? '내 정보를 불러오는 중이거나(또는 실패) 내 순위를 표시할 수 없어요.'
                : '로그인 토큰이 없어서 내 순위를 표시할 수 없어요.'}
            </Text>
          </Card>
        )}
      </Stack>

      {/* 정렬 */}
      <Group justify="center">
        <SegmentedControl
          value={sortBy}
          onChange={handleSortChange}
          data={[
            { label: '에버리지', value: 'average' },
            { label: '승률', value: 'winRate' },
            { label: '핸디', value: 'handicap' },
          ]}
        />
        <ActionIcon variant="default" size="lg" onClick={toggleSortDirection}>
          {sortDirection === 'desc' ? <IconArrowDown size={16} /> : <IconArrowUp size={16} />}
        </ActionIcon>
      </Group>

      {renderList.length === 0 ? (
        <Text ta="center" mt="md">
          {mode === 'month' ? '해당 월 기록이 없습니다.' : '랭킹 데이터가 없습니다.'}
        </Text>
      ) : (
        <Stack mt="md" px="xs">
          {renderList.map((item, index) => {
            const isMe = myUserId && String(item.userId) === String(myUserId);
            const isGhost = !!myGhost && String(item.userId) === String(myGhost.userId);

            const rankNumber = isGhost ? '-' : `#${index + 1}`;

            return (
              <div key={`${item.userId}-${index}`} ref={isMe ? myRef : undefined}>
                <UnstyledButton
                  onClick={() => navigate(`/users/${item.userId}`)}
                  style={{ width: '100%' }}
                >
                  <Card
                    shadow={isMe ? 'md' : 'sm'}
                    p="md"
                    radius="md"
                    withBorder
                    style={{
                      borderWidth: isMe ? 2 : 1,
                      borderColor: isMe ? '#228be6' : undefined,
                      background: isMe ? 'rgba(34, 139, 230, 0.08)' : undefined,
                      opacity: isGhost ? 0.88 : 1,
                    }}
                  >
                    <Group justify="space-between" align="flex-start">
                      <Group align="flex-start">
                        <Title order={4} c={isGhost ? 'gray' : (index < 3 ? 'blue' : 'gray')}>
                          {rankNumber}
                        </Title>

                        <div>
                          <Group gap={6} wrap="wrap">
                            <Text fw={800}>
                              {item.nickname} ({item.handicap}점)
                            </Text>
                            {isMe && <Badge variant="filled">ME</Badge>}
                            {isGhost && (
                              <Badge variant="light" color="gray">
                                기록없음
                              </Badge>
                            )}
                          </Group>

                          <Text size="xs" c="dimmed">
                            {isGhost
                              ? '이번 달 기록이 없습니다.'
                              : `${item.totalGames}전 ${item.wins}승 ${item.draws}무 ${item.losses}패`}
                          </Text>
                        </div>
                      </Group>

                      <Group gap="xs">
                        <div>
                          <Text size="xs" c="dimmed" ta="right">승률</Text>
                          <Text fw={600} ta="right">{(item.winRate || 0).toFixed(1)}%</Text>
                        </div>
                        <div>
                          <Text size="xs" c="dimmed" ta="right">에버리지</Text>
                          <Text fw={600} ta="right">{(item.average || 0).toFixed(3)}</Text>
                        </div>
                      </Group>
                    </Group>
                  </Card>
                </UnstyledButton>
              </div>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

export default RankingPage;