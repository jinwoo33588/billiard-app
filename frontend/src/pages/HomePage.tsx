import React from 'react';
import StatsOverview from '../components/StatsOverview';
import GameList, { Game } from '../components/GameList';
import GameForm from '../components/GameForm';
// import UserMonthlyTrends from '../components/UserMonthlyTrends';
import { Stack, Title, Group, Button, Modal, Text, Container } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { User } from '../components/Login';

// ✅ 추가: 인사이트 데이터(최근 10판) + 배지 UI
import { useInsights } from '../features/insights/hooks';
import { InsightBadgeRow } from '../features/insights/components/InsightBadges';

interface HomePageProps {
  user: User;
  games: Game[];
  refreshGames: () => void;
}

function HomePage({ user, games, refreshGames }: HomePageProps) {
  const [gameModalOpened, { open: openGameModal, close: closeGameModal }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // ✅ 홈에서는 "가볍게" 최근 10판 기준으로 배지 표시
  // (로딩은 페이지 전체를 막지 않고, 데이터 들어오면 자연스럽게 배지만 뜨게)
  const { data: insights } = useInsights(10);

  const handleGameAdded = () => {
    refreshGames();
    closeGameModal();
  };

  return (
    <>
      {/* ✅ 모바일에서 좌우 여백을 약간만 주고(0도 가능), Stack gap도 줄임 */}
      <Container >
        <Stack gap={isMobile ? 'sm' : 'lg'}>
          <Group justify="space-between" align="center" wrap="nowrap">
            <Group gap={8} wrap="nowrap">
              <Title order={isMobile ? 3 : 2}>{user.nickname}님의 기록</Title>
              <Text c="dimmed" size={isMobile ? 'sm' : 'md'}>
                ({user.handicap}점)
              </Text>
            </Group>

            <Button size={isMobile ? 'sm' : 'md'} onClick={openGameModal}>
              새 경기 기록
            </Button>
          </Group>

          {/* ✅ 여기 추가: 요즘 폼 / 팀운 배지 (있을 때만 표시) */}
          {insights?.all && insights?.teamIndicators && (
            <InsightBadgeRow all={insights.all} team={insights.teamIndicators} />
          )}

          <StatsOverview games={games} />
          {/* <UserMonthlyTrends games={games} /> */}

          <GameList games={games} onListChange={refreshGames} showActions={true} />
        </Stack>
      </Container>

      <Modal opened={gameModalOpened} onClose={closeGameModal} title="새 경기 기록" centered>
        <GameForm onGameAdded={handleGameAdded} />
      </Modal>
    </>
  );
}

export default HomePage;