import React from 'react';
import { Badge, Card, Group, Progress, Text } from '@mantine/core';
import type { InsightAnalysis } from '../types';
import { fmt, skillScoreFromDelta } from '../metrics';

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function SkillCard({ all }: { all: InsightAnalysis }) {
  const score = all?.stats ? skillScoreFromDelta(num(all.stats.delta)) : null;

  const expected = all?.benchmark ? num(all.benchmark.expected, NaN) : NaN;
  const delta = all?.stats ? num(all.stats.delta, NaN) : NaN;

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={4}>
        <Text fw={700}>실력 지표</Text>
        <Badge variant="light" radius="xl">
          기대 대비
        </Badge>
      </Group>

      {all?.stats === null || score === null ? (
        <Text size="sm" c="dimmed">
          데이터가 부족합니다.
        </Text>
      ) : (
        <>
          <Text size="xs" c="dimmed">
            50이 “기대치”, 높을수록 기대보다 잘 치는 상태
          </Text>

          <Progress value={score} mt="sm" radius="xl" />

          <Group justify="space-between" mt={6}>
            <Text size="xs" c="dimmed">
              낮음
            </Text>
            <Text size="xs" c="dimmed">
              높음
            </Text>
          </Group>

          <Text mt="sm" fw={800}>
            Δ {delta >= 0 ? '+' : ''}
            {fmt(delta, 3)}
          </Text>

          <Text size="xs" c="dimmed">
            기대 에버 {fmt(expected, 3)}
          </Text>
        </>
      )}
    </Card>
  );
}