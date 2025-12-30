import React, { useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from '@mantine/form';
import {
  NumberInput,
  Select,
  Button,
  Group,
  Box,
  Title,
  Grid,
  Card,
  Textarea,
  SegmentedControl,
  Stack,
  Text,
  Divider,
  Badge,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';

interface GameFormProps {
  onGameAdded: () => void;
}

type ResultType = '승' | '무' | '패';

// ✅ 혹시 어디서 string이 섞여 들어와도 안전하게 Date로 정규화
function toDate(value: unknown): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date();
}

function GameForm({ onGameAdded }: GameFormProps) {
  const form = useForm({
    initialValues: {
      score: '' as number | '',
      inning: '' as number | '',
      result: '승' as ResultType,
      gameType: '2v2v2',
      gameDate: new Date() as Date, // ✅ Date로 고정
      memo: '',
    },
    validate: {
      score: (value) => (value === '' ? '점수를 입력하세요.' : null),
      inning: (value) => (value === '' ? '이닝을 입력하세요.' : null),
      gameDate: (value) => (value ? null : '날짜를 선택하세요.'),
    },
  });

  // ✅ Avg 미리보기
  const avgPreview = useMemo(() => {
    const s = Number(form.values.score);
    const i = Number(form.values.inning);
    if (!Number.isFinite(s) || !Number.isFinite(i) || i <= 0) return null;
    return (s / i).toFixed(3);
  }, [form.values.score, form.values.inning]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      // ✅ 서버로 보낼 때는 ISO 문자열로 보내는게 제일 안정적(추천)
      const gameData = {
        ...values,
        score: Number(values.score),
        inning: Number(values.inning),
        gameDate: toDate(values.gameDate).toISOString(),
      };

      await axiosInstance.post('/games', gameData);
      alert('경기가 기록되었습니다!');
      onGameAdded();

      form.reset();
      // reset 후 기본값 다시 세팅
      form.setValues({
        score: '',
        inning: '',
        result: '승',
        gameType: '2v2v2',
        gameDate: new Date(),
        memo: '',
      });
    } catch (error) {
      console.error('기록 실패:', error);
      alert('기록에 실패했습니다.');
    }
  };

  return (
    <Card p={{ base: 'md', sm: 'lg' }} radius="md" withBorder>
      <Title order={3} mb="sm">
        새 경기 기록
      </Title>

      <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          {/* ✅ 달력이 처음부터 보이게 + 일요일 시작 */}
          <div>
            <Group justify="space-between" align="baseline" mb={6}>
              <Text size="sm" fw={600}>
                경기 날짜
              </Text>
              <Text size="xs" c="dimmed">
                오늘: {new Date().toLocaleDateString('ko-KR')}
              </Text>
            </Group>

            <DatePicker
              value={toDate(form.values.gameDate)}
              onChange={(v) => form.setFieldValue('gameDate', v ?? new Date())}
              locale="ko"
              firstDayOfWeek={0}     // ✅ 일요일 시작
              numberOfColumns={1}
              highlightToday
              size="md"
            />
          </div>

          <Divider />

          <Grid>
            <Grid.Col span={6}>
              <NumberInput
                label="이닝"
                placeholder="예: 20"
                required
                min={0}
                clampBehavior="strict"
                {...form.getInputProps('inning')}
              />
            </Grid.Col>

            <Grid.Col span={6}>
              <NumberInput
                label="점수"
                placeholder="예: 18"
                required
                min={0}
                clampBehavior="strict"
                {...form.getInputProps('score')}
              />
            </Grid.Col>

            {/* ✅ Avg 미리보기 */}
            <Grid.Col span={12}>
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600}>
                  에버리지 미리보기
                </Text>
                <Badge variant="light" radius="xl">
                  {avgPreview ? `Avg: ${avgPreview}` : '점수/이닝 입력 시 표시'}
                </Badge>
              </Group>
            </Grid.Col>

            <Grid.Col span={12}>
              <Text size="sm" fw={600} mb={6}>
                결과
              </Text>

              <Group grow gap="xs">
                <Button
                  radius="xl"
                  color="blue"
                  variant={form.values.result === '승' ? 'filled' : 'light'}
                  onClick={() => form.setFieldValue('result', '승')}
                >
                  승
                </Button>

                <Button
                  radius="xl"
                  color="gray"
                  variant={form.values.result === '무' ? 'filled' : 'light'}
                  onClick={() => form.setFieldValue('result', '무')}
                >
                  무
                </Button>

                <Button
                  radius="xl"
                  color="red"
                  variant={form.values.result === '패' ? 'filled' : 'light'}
                  onClick={() => form.setFieldValue('result', '패')}
                >
                  패
                </Button>
              </Group>
            </Grid.Col>

            <Grid.Col span={12}>
              <Select
                label="방식"
                data={['1v1', '2v2', '2v2v2', '3v3', '3v3v3']}
                required
                value={form.values.gameType}
                onChange={(v) => form.setFieldValue('gameType', (v || '2v2v2') as string)}
              />
            </Grid.Col>

            <Grid.Col span={12}>
              <Textarea
                label="메모"
                placeholder="간단한 메모"
                autosize
                minRows={2}
                maxRows={4}
                {...form.getInputProps('memo')}
              />
            </Grid.Col>
          </Grid>

          <Group justify="flex-end">
            <Button type="submit" radius="xl">
              기록하기
            </Button>
          </Group>
        </Stack>
      </Box>
    </Card>
  );
}

export default GameForm;