import React from 'react';
import Statistics from '../components/Statistics';
import GameList, { Game } from '../components/GameList';
import GameForm from '../components/GameForm';
import { Stack, Title, Group, Button, Modal, Text, Container } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { User } from '../components/Login';

interface HomePageProps {
  user: User;
  games: Game[];
  refreshGames: () => void;
}

function HomePage({ user, games, refreshGames }: HomePageProps) {
  const [gameModalOpened, { open: openGameModal, close: closeGameModal }] = useDisclosure(false);

  const handleGameAdded = () => {
    refreshGames();
    closeGameModal();
  };

  return (
    <>
      <Container size="lg" p={0}>
        <Stack>
          <Group justify="space-between">
            <Group>
              <Title order={2}>{user.nickname}님의 기록</Title>
              {/* [수정] c -> color 로 속성명 변경 */}
              <Text color="dimmed">({user.handicap}점)</Text>
            </Group>
            <Button onClick={openGameModal}>새 경기 기록</Button>
          </Group>
          <Statistics games={games} />
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