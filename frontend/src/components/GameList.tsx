import React, { useMemo, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from '@mantine/form';
import {
  Text,
  Group,
  Modal,
  Button,
  Box,
  Stack,
  Title,
  Grid,
  NumberInput,
  Select,
  Textarea,
  Divider,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';

import GameRow from './GameRow';
import type { Game } from './GameCard';
export type { Game } from './GameCard';

interface GameListProps {
  games: Game[];
  onListChange?: () => void;
  showActions?: boolean;

  // ✅ 홈에서만 10개 제한을 쓰고 싶으면 props로 제어 가능하게
  initialLimit?: number; // default 10
  enablePagination?: boolean; // default true
}

function GameList({
  games,
  onListChange = () => {},
  showActions = false,
  initialLimit = 10,
  enablePagination = true,
}: GameListProps) {
  const [editingGame, setEditingGame] = useState<Game | null>(null);

  // ✅ 더보기: 처음엔 10개만
  const [visibleCount, setVisibleCount] = useState(enablePagination ? initialLimit : games.length);

  // games가 바뀌면(새 기록 추가/삭제) visibleCount도 자연스럽게 맞춤
  useEffect(() => {
    if (!enablePagination) {
      setVisibleCount(games.length);
      return;
    }
    setVisibleCount((prev) => Math.min(Math.max(prev, initialLimit), games.length));
  }, [games.length, enablePagination, initialLimit]);

  const form = useForm({
    initialValues: {
      score: '' as number | '',
      inning: '' as number | '',
      result: '승',
      gameType: '1v1',
      gameDate: null as Date | null,
      memo: '',
    },
    validate: {
      gameDate: (value) => (value ? null : '날짜를 선택하세요.'),
      score: (value) => (value === '' ? '점수를 입력하세요.' : null),
      inning: (value) => (value === '' ? '이닝을 입력하세요.' : null),
    },
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

  // ✅ GameRow와 같은 고정 폭(헤더도 동일해야 정렬됨)
  const W = {
    result: 44,
    inning: 48,
    avg: 72,
    score: 56,
    actions: 34,
  };

  // ✅ 보여줄 데이터 (최신순 정렬이 이미 되어있다는 가정. 혹시 아니라면 여기서 정렬해도 됨)
  const visibleGames = useMemo(() => {
    if (!enablePagination) return games;
    return games.slice(0, visibleCount);
  }, [games, visibleCount, enablePagination]);

  const canShowMore = enablePagination && visibleCount < games.length;
  const isExpanded = enablePagination && games.length > initialLimit && visibleCount >= games.length;

  const handleShowMore = () => {
    // ✅ “더보기”는 한 번에 10개씩 증가
    setVisibleCount((prev) => Math.min(prev + initialLimit, games.length));
  };

  const handleCollapse = () => {
    setVisibleCount(Math.min(initialLimit, games.length));
  };

  return (
    <>
      <Stack>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Title order={3}>최근 경기 기록</Title>
          {enablePagination && games.length > 0 && (
            <Text size="xs" c="dimmed">
              {Math.min(visibleCount, games.length)} / {games.length}
            </Text>
          )}
        </Group>

        {games.length === 0 ? (
          <Text>기록된 경기가 없습니다.</Text>
        ) : (
          <Stack gap="xs">
            {/* ✅ 상단 헤더(작은 글씨) */}
            <Group justify="space-between" wrap="nowrap" px="xs">
              <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                날짜/방식
              </Text>

              <Group gap={0} wrap="nowrap">
                <Text size="xs" c="dimmed" style={{ width: W.result, textAlign: 'center' }}>
                  결과
                </Text>
                <Text size="xs" c="dimmed" style={{ width: W.inning, textAlign: 'right' }}>
                  이닝
                </Text>

                <Text size="xs" c="dimmed" style={{ width: W.score, textAlign: 'right' }}>
                  점수
                </Text>

                <Text size="xs" c="dimmed" style={{ width: W.avg, textAlign: 'right' }}>
                  에버
                </Text>

                {showActions && <div style={{ width: W.actions }} />}
              </Group>
            </Group>

            {/* ✅ 한 줄 리스트(표 느낌): slice 적용 */}
            {visibleGames.map((game) => (
              <GameRow
                key={game._id}
                game={game}
                showActions={showActions}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}

            {/* ✅ 더보기 / 접기 */}
            {enablePagination && games.length > initialLimit && (
              <>
                <Divider my={4} />

                <Group justify="center">
                  {canShowMore ? (
                    <Button variant="light" radius="xl" onClick={handleShowMore}>
                      더보기 (+{Math.min(initialLimit, games.length - visibleCount)}개)
                    </Button>
                  ) : (
                    <Button variant="subtle" radius="xl" onClick={handleCollapse}>
                      접기
                    </Button>
                  )}
                </Group>
              </>
            )}
          </Stack>
        )}
      </Stack>

      <Modal opened={!!editingGame} onClose={handleCloseModal} title="경기 기록 수정">
        <Box component="form" onSubmit={form.onSubmit(handleUpdateSubmit)}>
          <Grid>
            <Grid.Col span={12}>
              <DatePickerInput label="경기 날짜" required {...form.getInputProps('gameDate')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput label="이닝 수" required {...form.getInputProps('inning')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <NumberInput label="내 점수" required {...form.getInputProps('score')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select label="결과" data={['승', '무', '패']} required {...form.getInputProps('result')} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="방식"
                data={['1v1', '2v2', '2v2v2', '3v3', '3v3v3']}
                required
                {...form.getInputProps('gameType')}
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <Textarea label="메모" {...form.getInputProps('memo')} />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end" mt="xl">
            <Button variant="default" onClick={handleCloseModal}>
              취소
            </Button>
            <Button type="submit">저장</Button>
          </Group>
        </Box>
      </Modal>
    </>
  );
}

export default GameList;