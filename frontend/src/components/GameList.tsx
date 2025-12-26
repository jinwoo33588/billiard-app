import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from '@mantine/form';
import { Card, Text, Group, ActionIcon, Modal, Button, Box, Menu, Stack, Title, SimpleGrid, Grid, NumberInput, Select, Textarea } from '@mantine/core';
import { IconPencil, IconTrash, IconDotsVertical } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';
import { useMediaQuery } from '@mantine/hooks';

export interface Game {
  _id: string;
  score: number;
  inning: number;
  result: '승' | '무' | '패';
  gameType: string;
  gameDate: string;
  memo?: string;
}

interface GameListProps {
  games: Game[];
  onListChange?: () => void; // [수정] ?를 추가하여 선택적 prop으로 변경
  showActions?: boolean;
}

function GameList({ games, onListChange = () => {}, showActions = false }: GameListProps) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const form = useForm({
    initialValues: {
      score: '' as number | '',
      inning: '' as number | '',
      result: '승',
      gameType: '1v1',
      gameDate: null as Date | null,
      memo: ''
    },
    validate: {
      gameDate: (value) => (value ? null : '날짜를 선택하세요.'),
      score: (value) => (value === '' ? '점수를 입력하세요.' : null),
      inning: (value) => (value === '' ? '이닝을 입력하세요.' : null),
    }
  });

  const handleCloseModal = () => {
    setEditingGame(null);
    form.reset();
  };

  const handleEditClick = (game: Game) => {
    setEditingGame(game);
    form.setValues({
      score: game.score,
      inning: game.inning,
      result: game.result,
      gameType: game.gameType,
      gameDate: new Date(game.gameDate),
      memo: game.memo || '',
    });
  };

  const handleDeleteClick = async (gameId: string) => {
    if (window.confirm('정말로 이 기록을 삭제하시겠습니까?')) {
      try {
        await axiosInstance.delete(`/games/${gameId}`);
        alert('기록이 삭제되었습니다.');
        onListChange();
      } catch (error) {
        console.error('삭제 실패:', error);
      }
    }
  };

  const handleUpdateSubmit = async (values: typeof form.values) => {
    if (!editingGame) return;
    try {
      const updatedData = { ...values, score: Number(values.score), inning: Number(values.inning) };
      await axiosInstance.put(`/games/${editingGame._id}`, updatedData);
      alert('기록이 수정되었습니다.');
      onListChange();
      handleCloseModal();
    } catch (error) {
      console.error('수정 실패:', error);
    }
  };

  return (
    <>
      <Stack>
        <Title order={3}>최근 경기 기록</Title>
        {games.length === 0 ? (
          <Text>기록된 경기가 없습니다.</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
            {games.map((game) => (
              <Card key={game._id} >
                <Group justify="space-between">
                  <Stack gap={0}>
                    <Text fw={500}>{new Date(game.gameDate).toLocaleDateString()}</Text>
                    <Text size="sm" c="dimmed">{game.gameType}</Text>
                  </Stack>
                  {showActions && (
                    <Menu  width={200}>
                      <Menu.Target>
                        <ActionIcon variant="subtle" color="gray"><IconDotsVertical size={16} /></ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => handleEditClick(game)}>수정</Menu.Item>
                        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDeleteClick(game._id)}>삭제</Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  )}
                </Group>
                
                <Group justify="space-around" mt="md" mb="xs">
                  <div><Text size="sm" c="dimmed">결과</Text><Text size="xl" fw={700}>{game.result}</Text></div>
                  <div><Text size="sm" c="dimmed">이닝</Text><Text size="xl" fw={700}>{game.inning}</Text></div>
                  <div><Text size="sm" c="dimmed">점수</Text><Text size="xl" fw={700}>{game.score}</Text></div>
                  <div>
                    <Text size="sm" c="dimmed">에버리지</Text>
                    <Text size="xl" fw={700}>
                      {game.inning > 0 ? (game.score / game.inning).toFixed(3) : 'N/A'}
                    </Text>
                  </div>
                </Group>
                
                {game.memo && <Text mt="sm" size="sm" c="dimmed">메모: {game.memo}</Text>}
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Stack>
      
      <Modal opened={!!editingGame} onClose={handleCloseModal} title="경기 기록 수정">
        <Box component="form" onSubmit={form.onSubmit(handleUpdateSubmit)}>
          <Grid>
            <Grid.Col span={12}><DatePickerInput label="경기 날짜" required {...form.getInputProps('gameDate')} /></Grid.Col>
            <Grid.Col span={6}><NumberInput label="이닝 수" required {...form.getInputProps('inning')} /></Grid.Col>
            <Grid.Col span={6}><NumberInput label="내 점수" required {...form.getInputProps('score')} /></Grid.Col>
            <Grid.Col span={6}><Select label="결과" data={['승', '무', '패']} required {...form.getInputProps('result')} /></Grid.Col>
            <Grid.Col span={6}><Select label="방식" data={['1v1', '2v2', '2v2v2', '3v3', '3v3v3']} required {...form.getInputProps('gameType')} /></Grid.Col>
            <Grid.Col span={12}><Textarea label="메모" {...form.getInputProps('memo')} /></Grid.Col>
          </Grid>
          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={handleCloseModal}>취소</Button>
            <Button type="submit">저장</Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
}

export default GameList;