import React from 'react';
import { Badge, Group } from '@mantine/core';
import type { InsightAnalysis, TeamIndicators } from '../types';

function formBadgeProps(status: InsightAnalysis['status']) {
  switch (status) {
    case '매우좋음':
      return { color: 'green', label: '🔥 폼 매우좋음' } as const;
    case '좋음':
      return { color: 'teal', label: '⬆️ 폼 좋음' } as const;
    case '보통':
      return { color: 'blue', label: '➖ 폼 보통' } as const;
    case '부진':
      return { color: 'orange', label: '⬇️ 폼 부진' } as const;
    case '매우부진':
      return { color: 'red', label: '🧊 폼 매우부진' } as const;
    default:
      return { color: 'gray', label: '🧪 폼 보류' } as const;
  }
}

function teamLuckBadgeProps(team: TeamIndicators) {
  if (!team || team.sampleN < 5) return { color: 'gray', label: '🧩 팀운 보류' } as const;

  const badRate = team.rates.teamLuckBadRate;
  const carryRate = team.rates.teamCarryRate;

  const badW = team.weighted.luckBadScore;
  const carryW = team.weighted.carryScore;

  // ✅ “강도” 기준(너가 수정하기 쉬움)
  // - 할만패 강도가 크면 팀운 나쁨
  // - 덜승(버스) 강도가 크면 버스
  // - 둘 다 낮으면 균형
  const isBad = (badRate >= 25 && badW >= carryW * 1.2) || badW >= 20;
  const isBus = (carryRate >= 25 && carryW >= badW * 1.2) || carryW >= 20;

  if (isBad) {
    const level = badW >= 35 ? '강' : badW >= 22 ? '중' : '약';
    return { color: 'red', label: `🎲 팀운 나쁨(${level})` } as const;
  }

  if (isBus) {
    const level = carryW >= 35 ? '강' : carryW >= 22 ? '중' : '약';
    return { color: 'yellow', label: `🚌 버스(${level})` } as const;
  }

  return { color: 'green', label: '✅ 팀전 균형' } as const;
}

export function InsightBadgeRow({
  all,
  team,
  compact = true,
}: {
  all: InsightAnalysis;
  team: TeamIndicators;
  compact?: boolean;
}) {
  const f = formBadgeProps(all.status);
  const t = teamLuckBadgeProps(team);

  return (
    <Group gap={compact ? 6 : 'xs'} wrap="wrap">
      <Badge variant="light" radius="xl" color={f.color}>
        {f.label}
      </Badge>
      <Badge variant="light" radius="xl" color={t.color}>
        {t.label}
      </Badge>
    </Group>
  );
}