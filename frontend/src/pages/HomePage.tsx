import React from 'react';
import Statistics from '../components/Statistics';
import GameList, { Game } from '../components/GameList';
import { Stack, Title } from '@mantine/core';
import { User } from '../components/Login';

interface HomePageProps {
  user: User;
  games: Game[];
}

function HomePage({ user, games }: HomePageProps) {
  return (
    <Stack>
      <Title order={2}>{user.nickname}님의 기록</Title>
      <Statistics games={games} />
      <GameList games={games} onListChange={() => {}} />
    </Stack>
  );
}

export default HomePage;