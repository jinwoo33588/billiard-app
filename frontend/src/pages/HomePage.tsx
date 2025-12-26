import React from 'react';
import Statistics from '../components/Statistics';
import GameList, { Game } from '../components/GameList';
import GameForm from '../components/GameForm';
import UserMonthlyTrends from '../components/UserMonthlyTrends';
import { Stack, Title, Group, Button, Modal, Text, Container } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { User } from '../components/Login';

interface HomePageProps {
  user: User;
  games: Game[];
  refreshGames: () => void;
}

function HomePage({ user, games, refreshGames }: HomePageProps) {
  const [gameModalOpened, { open: openGameModal, close: closeGameModal }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  const handleGameAdded = () => {
    refreshGames();
    closeGameModal();
  };

  return (
    <>
      {/* ✅ 모바일에서 좌우 여백을 약간만 주고(0도 가능), Stack gap도 줄임 */}
      <Container fluid px="sm" py="sm">
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

          <Statistics games={games} />
          <UserMonthlyTrends games={games} />
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