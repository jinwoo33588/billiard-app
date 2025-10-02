import React from 'react';
import GameForm from '../components/GameForm';
import { Stack } from '@mantine/core';

interface RecordPageProps {
  onGameAdded: () => void;
}

function RecordPage({ onGameAdded }: RecordPageProps) {
  return (
    <Stack>
      <GameForm onGameAdded={onGameAdded} />
    </Stack>
  );
}
export default RecordPage;