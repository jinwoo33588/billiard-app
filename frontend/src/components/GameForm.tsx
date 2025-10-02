import React from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from '@mantine/form';
import { NumberInput, Select, Button, Group, Box, Title, Grid, Card, Textarea } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

interface GameFormProps { onGameAdded: () => void; }

function GameForm({ onGameAdded }: GameFormProps) {
  const form = useForm({
    initialValues: {
      score: '' as number|'', inning: '' as number|'', result: '승',
      gameType: '1v1', gameDate: new Date(), memo: '',
    },
    validate: {
      score: (v) => (v === '' ? '점수 입력' : null),
      inning: (v) => (v === '' ? '이닝 입력' : null),
      gameDate: (v) => (v ? null : '날짜 선택'),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const gameData = { ...values, score: Number(values.score), inning: Number(values.inning) };
      await axiosInstance.post('/games', gameData);
      alert('경기가 기록되었습니다!');
      onGameAdded();
      form.reset();
    } catch (error) {
      console.error('기록 실패:', error);
      alert('기록에 실패했습니다.');
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Title order={3} mb="md">새 경기 기록</Title>
      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Grid>
          <Grid.Col span={12}><DatePickerInput label="경기 날짜" required {...form.getInputProps('gameDate')} /></Grid.Col>
          <Grid.Col span={6}><NumberInput label="내 점수" required {...form.getInputProps('score')} /></Grid.Col>
          <Grid.Col span={6}><NumberInput label="이닝 수" required {...form.getInputProps('inning')} /></Grid.Col>
          <Grid.Col span={6}><Select label="결과" data={['승', '무', '패']} required {...form.getInputProps('result')} /></Grid.Col>
          <Grid.Col span={6}><Select label="방식" data={['1v1', '2v2', '2v2v2', '3v3', '3v3v3']} required {...form.getInputProps('gameType')} /></Grid.Col>
          <Grid.Col span={12}><Textarea label="메모" placeholder="간단한 메모" {...form.getInputProps('memo')} /></Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="xl"><Button type="submit">기록하기</Button></Group>
      </Box>
    </Card>
  );
}
export default GameForm;