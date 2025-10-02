import React from 'react';
import Statistics from '../components/Statistics';
import GameList, { Game } from '../components/GameList';
import GameForm from '../components/GameForm';
import { Stack, Title, Group, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { User } from '../components/Login';

interface HomePageProps {
  user: User;
  games: Game[];
  refreshGames: () => void;
}

function HomePage({ user, games, refreshGames }: HomePageProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const handleGameAdded = () => {
    refreshGames(); // 목록 새로고침
    close(); // 모달 닫기
  };

  return (
    <>
      <Stack>
        <Group justify="space-between">
          <Title order={2}>{user.nickname}님의 기록</Title>
          <Button onClick={open}>새 경기 기록</Button>
        </Group>
        <Statistics games={games} />
        <GameList games={games} onListChange={refreshGames} showActions={true} />
      </Stack>

      <Modal opened={opened} onClose={close} title="새 경기 기록" centered>
        <GameForm onGameAdded={handleGameAdded} />
      </Modal>
    </>
  );
}

export default HomePage;