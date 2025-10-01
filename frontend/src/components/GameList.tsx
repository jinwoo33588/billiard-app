import React, { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from '@mantine/form';
import { Card, Table, Title, Text, Group, ActionIcon, Modal, Grid, NumberInput, Select, Textarea, Button, Box } from '@mantine/core';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import { DatePickerInput } from '@mantine/dates';

export interface Game {
  _id: string; score: number; inning: number;
  result: '승' | '무' | '패';
  gameType: string; gameDate: string; memo?: string;
}

interface GameListProps {
  games: Game[];
  onListChange: () => void;
}

function GameList({ games, onListChange }: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  const form = useForm({
    initialValues: {
      score: '' as number | '',
      inning: '' as number | '',
      result: '승',
      gameType: '1v1',
      gameDate: null as Date | null,
      memo: '',
    },
    validate: { gameDate: (value) => (value ? null : '날짜를 선택하세요.') }
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
        alert('기록 삭제에 실패했습니다.');
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
      alert('기록 수정에 실패했습니다.');
    }
  };

  const rows = games.map((game) => (
    <Table.Tr key={game._id}>
      <Table.Td>{new Date(game.gameDate).toLocaleDateString()}</Table.Td>
      <Table.Td>{game.gameType}</Table.Td>
      <Table.Td>{game.result}</Table.Td>
      <Table.Td>{game.score}</Table.Td>
      <Table.Td>{game.inning}</Table.Td>
      <Table.Td>{game.inning > 0 ? (game.score / game.inning).toFixed(3) : 'N/A'}</Table.Td>
      <Table.Td style={{ minWidth: 150, whiteSpace: 'pre-wrap' }}>{game.memo}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <ActionIcon variant="light" onClick={() => handleEditClick(game)}><IconPencil size={16} /></ActionIcon>
          <ActionIcon color="red" variant="light" onClick={() => handleDeleteClick(game._id)}><IconTrash size={16} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Card shadow="sm" p="lg" radius="md" withBorder>
        <Title order={3} mb="md">내 경기 기록</Title>
        {games.length === 0 ? (
          <Text>기록된 경기가 없습니다.</Text>
        ) : (
          <Table.ScrollContainer minWidth={800}>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>날짜</Table.Th>
                  <Table.Th>방식</Table.Th>
                  <Table.Th>결과</Table.Th>
                  <Table.Th>점수</Table.Th>
                  <Table.Th>이닝</Table.Th>
                  <Table.Th>에버리지</Table.Th>
                  <Table.Th>메모</Table.Th>
                  <Table.Th>관리</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        )}
      </Card>
      
      <Modal opened={!!editingGame} onClose={handleCloseModal} title="경기 기록 수정">
        <Box component="form" onSubmit={form.onSubmit(handleUpdateSubmit)}>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 4 }}><DatePickerInput label="경기 날짜" required {...form.getInputProps('gameDate')} /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}><NumberInput label="내 점수" required {...form.getInputProps('score')} /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 4 }}><NumberInput label="이닝 수" required {...form.getInputProps('inning')} /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}><Select label="승/무/패" data={['승', '무', '패']} required {...form.getInputProps('result')} /></Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6 }}><Select label="게임 방식" data={['1v1', '2v2', '2v2v2', '3v3', '3v3v3']} required {...form.getInputProps('gameType')} /></Grid.Col>
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