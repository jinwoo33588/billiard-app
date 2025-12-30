import React, { useMemo } from 'react';
import { Badge, Card, Divider, Group, Progress, SimpleGrid, Text } from '@mantine/core';
import type { TeamIndicators } from '../types';
import { fmt, teamLuckScoreFromRates } from '../metrics';

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function safeHeadline(team: TeamIndicators) {
  const h = (team as any)?.headline;
  if (typeof h === 'string' && h.trim().length > 0) return h;
  // headline이 없을 때 자동 요약
  const bad = num(team?.rates?.teamLuckBadRate, 0);
  const bus = num(team?.rates?.teamCarryRate, 0);
  if (bad >= 25 && bad >= bus * 1.1) return '할만패 비중이 높아요 → 팀/매칭 영향 가능';
  if (bus >= 25 && bus >= bad * 1.1) return '덜승 비중이 높아요 → 버스/캐리 구간 가능';
  return '팀전 결과가 비교적 균형적이에요';
}

export default function TeamLuckCard({ team }: { team: TeamIndicators }) {
  const sampleN = num(team?.sampleN, 0);
  const rates = team?.rates;

  const score = useMemo(() => {
    // teamLuckScoreFromRates 내부에서 sampleN<5면 null 반환하도록 되어있음
    return teamLuckScoreFromRates(rates as any, sampleN);
  }, [rates, sampleN]);

  const headline = useMemo(() => safeHeadline(team), [team]);

  const badRate = num(rates?.teamLuckBadRate, NaN);
  const carryRate = num(rates?.teamCarryRate, NaN);
  const needImproveRate = num(rates?.needImproveRate, NaN);
  const synergyWinRate = num(rates?.synergyWinRate, NaN);

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={4}>
        <Text fw={700}>팀운 지표</Text>
        <Badge variant="light" radius="xl" color="gray">
          팀전
        </Badge>
      </Group>

      {sampleN < 5 || score === null ? (
        <Text size="sm" c="dimmed">
          팀전 표본이 부족해요. (승/패 기준 최소 5판 권장)
        </Text>
      ) : (
        <>
          <Text size="xs" c="dimmed">
            “내 점수 vs 내 핸디”와 결과 불일치가 클수록 팀/매칭 영향 가능
          </Text>

          <Progress value={num(score, 0)} mt="sm" radius="xl" />

          <Group justify="space-between" mt={6}>
            <Text size="xs" c="dimmed">
              영향 적음
            </Text>
            <Text size="xs" c="dimmed">
              영향 큼
            </Text>
          </Group>

          <Text mt="sm" fw={800}>
            {headline}
          </Text>

          <Divider my="sm" />

          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">
                할 만큼 했는데 패
              </Text>
              <Text fw={800} size="lg">
                {fmt(badRate, 1)}%
              </Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">
                덜 했는데 승
              </Text>
              <Text fw={800} size="lg">
                {fmt(carryRate, 1)}%
              </Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">
                덜 했는데 패
              </Text>
              <Text fw={800} size="lg">
                {fmt(needImproveRate, 1)}%
              </Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">
                할 만큼 하고 승
              </Text>
              <Text fw={800} size="lg">
                {fmt(synergyWinRate, 1)}%
              </Text>
            </div>
          </SimpleGrid>

          <Text size="xs" c="dimmed" mt="sm">
            팀전 표본 {sampleN}판(승/패) · 무승부 제외
          </Text>
        </>
      )}
    </Card>
  );
}