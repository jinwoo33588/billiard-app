import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Center,
  Collapse,
  Divider,
  Group,
  List,
  Loader,
  Progress,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { IconChevronDown, IconChevronUp, IconInfoCircle } from '@tabler/icons-react';

import { useInsights } from '../features/insights/hooks';
import { fmt, getConfidence, splitReasons, statusMeta } from '../features/insights/metrics';
import type { TeamIndicators } from '../features/insights/types';

type WindowOpt = '10' | '20' | '30';

// ✅ 어떤 값이 와도 숫자로 안전 변환
function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(v: any) {
  const x = num(v, 0);
  return Math.max(0, Math.min(100, x));
}

function levelLabel(score: any) {
  const s = clamp01(score);
  if (s >= 45) return '강';
  if (s >= 30) return '중';
  if (s >= 18) return '약';
  return '낮음';
}

function colorByScore(score: any) {
  const s = clamp01(score);
  if (s >= 45) return 'red';
  if (s >= 30) return 'orange';
  if (s >= 18) return 'yellow';
  return 'gray';
}

/**
 * ✅ TeamIndicators(기존 틀) → UI 4개 지표
 * - TEAM_LUCK_BAD: 팀운 나쁨(억울)
 * - TEAM_CARRY: 버스(덜치고 승)
 * - NEED_IMPROVE: 내 이슈(덜치고 패)
 * - TEAM_SYNERGY_GOOD: 캐리(많이치고 승)
 *
 * ⚠️ 여기서 절대 .toFixed() 쓰지 말고, fmt()/num()로만 처리
 */
function buildIndicators(team: TeamIndicators) {
  const w = team?.weighted ?? ({} as TeamIndicators['weighted']);
  const r = team?.rates ?? ({} as TeamIndicators['rates']);
  const c = team?.counts ?? ({} as TeamIndicators['counts']);

  return [
    {
      key: 'luck',
      title: '팀운 나쁨',
      emoji: '🎲',
      score: clamp01(w.luckBadScore),
      desc: '할 만큼 쳤는데 졌던 흐름',
      detail: `할만패 ${num(c.TEAM_LUCK_BAD)}판 · ${fmt(r.teamLuckBadRate, 1)}%`,
    },
    {
      key: 'bus',
      title: '버스',
      emoji: '🚌',
      score: clamp01(w.carryScore),
      desc: '덜 쳤는데 이긴 흐름',
      detail: `덜승 ${num(c.TEAM_CARRY)}판 · ${fmt(r.teamCarryRate, 1)}%`,
    },
    {
      key: 'self',
      title: '내 이슈',
      emoji: '🧊',
      score: clamp01(w.needImproveScore),
      desc: '덜 쳤고 졌던 흐름',
      detail: `덜패 ${num(c.NEED_IMPROVE)}판 · ${fmt(r.needImproveRate, 1)}%`,
    },
    {
      key: 'carry',
      title: '캐리',
      emoji: '🔥',
      score: clamp01(w.synergyScore),
      desc: '많이 쳤고 이긴 흐름',
      detail: `기여승 ${num(c.TEAM_SYNERGY_GOOD)}판 · ${fmt(r.synergyWinRate, 1)}%`,
    },
  ] as const;
}

function RecBadge({ delta, label }: { delta: any; label: string }) {
  const d = num(delta, 0);
  const color = d > 0 ? 'green' : d < 0 ? 'red' : 'gray';
  return (
    <Badge variant="light" radius="xl" color={color}>
      {label}
    </Badge>
  );
}

export default function InsightsPage() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [windowSize, setWindowSize] = useState<WindowOpt>('10');

  const { data, loading, errorMsg } = useInsights(Number(windowSize));
  const [opened, { toggle }] = useDisclosure(false);

  const all = data?.all;
  const team = data?.teamIndicators;

  const meta = all ? statusMeta(all.status) : statusMeta('데이터부족');
  const conf = all ? getConfidence(all.sampleN) : getConfidence(0);

  const reasons = all?.reasons ?? [];
  const { top, rest } = useMemo(() => splitReasons(reasons, 2), [reasons]);

  const indicators = useMemo(() => (team ? buildIndicators(team) : []), [team]);

  const quickSummary = useMemo(() => {
    if (!all || !team) return '';
    const s = all.stats;

    const formText = all.status === '데이터부족' ? '폼 판단 보류' : `폼: ${meta.label}`;

    const teamText =
      num(team.sampleN) < 5
        ? '팀운: 보류'
        : (() => {
            const bad = num(team.weighted?.luckBadScore);
            const bus = num(team.weighted?.carryScore);
            if (bad >= 30 && bad >= bus * 1.1) return `팀운: 나쁨(${levelLabel(bad)})`;
            if (bus >= 30 && bus >= bad * 1.1) return `팀운: 버스(${levelLabel(bus)})`;
            return '팀운: 균형';
          })();

    if (!s) return `${formText} · ${teamText}`;
    return `${formText} · ${teamText} · 최근Avg ${fmt(s.recentAvg, 3)}`;
  }, [all, team, meta.label]);

  if (loading) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Loader />
      </Center>
    );
  }

  if (errorMsg) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center">
          <Text c="red">{errorMsg}</Text>
          <Text size="sm" c="dimmed">
            잠시 후 다시 시도해주세요.
          </Text>
        </Stack>
      </Center>
    );
  }

  if (!data || !all || !team) {
    return (
      <Center style={{ minHeight: '60vh' }}>
        <Text c="dimmed">표시할 데이터가 없습니다.</Text>
      </Center>
    );
  }

  const stats = all.stats; // null 가능
  const bench = all.benchmark;

  return (
    <Stack gap="sm">
      {/* 헤더 */}
      <Group justify="space-between" align="flex-end" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Title order={3} style={{ lineHeight: 1.1 }}>
            {`분석 · 핸디 ${data.handicap}점`}
          </Title>
          <Text size="sm" c="dimmed">
            최근 {data.window}판 기준
          </Text>
          {isMobile && (
            <Text size="xs" c="dimmed" mt={4}>
              {quickSummary}
            </Text>
          )}
        </div>

        <Select
          value={windowSize}
          onChange={(v) => setWindowSize((v as WindowOpt) || '10')}
          data={[
            { value: '10', label: '최근 10판' },
            { value: '20', label: '최근 20판' },
            { value: '30', label: '최근 30판' },
          ]}
          w={isMobile ? 120 : 140}
          radius="xl"
          size="sm"
        />
      </Group>

      {/* 상단 결론 카드 */}
      <Card withBorder radius="md" p="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Group gap="xs" wrap="wrap">
            <Badge color={meta.color} variant="filled" radius="xl">
              {meta.emoji} {meta.label}
            </Badge>
            <Badge variant="light" radius="xl" color={conf.color}>
              신뢰도 {conf.level}
            </Badge>
          </Group>

          <RecBadge delta={all.recommendation?.handicapDelta} label={all.recommendation?.label ?? '-'} />
        </Group>

        <Divider my="sm" />

        {!stats ? (
          <Text size="sm" c="dimmed">
            최근 기록이 적어서 아직 확정 판단을 내리기 어려워요. (최소 5판 필요)
          </Text>
        ) : (
          <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">
                최근 평균 에버
              </Text>
              <Text fw={800} size="xl">
                {fmt(stats.recentAvg, 3)}
              </Text>
              <Text size="xs" c="dimmed">
                기대 {fmt(bench?.expected, 3)} · Δ {num(stats.delta) >= 0 ? '+' : ''}
                {fmt(stats.delta, 3)}
              </Text>
            </div>

            <div style={{ textAlign: 'center' }}>
              <Text size="xs" c="dimmed">
                승률(무 제외)
              </Text>
              <Text fw={800} size="xl">
                {fmt(stats.winRate, 1)}%
              </Text>
              <Text size="xs" c="dimmed">
                {num(stats.wins)}승 {num(stats.draws)}무 {num(stats.losses)}패
              </Text>
            </div>
          </SimpleGrid>
        )}
      </Card>

      {/* 요즘 흐름 지표 */}
      <Card withBorder radius="md" p="sm">
        <Group justify="space-between" align="center" wrap="nowrap" mb={6}>
          <Text fw={800}>요즘 흐름 지표</Text>
          <Badge variant="light" radius="xl" color={num(team.sampleN) >= 5 ? 'blue' : 'gray'}>
            표본 {num(team.sampleN)}판
          </Badge>
        </Group>

        <Text size="xs" c="dimmed" mb="sm">
          * “내 점수(score) vs 내 핸디(handicap)” + 승패 + 에버 흐름을 종합해서 0~100 점수로 표시합니다.
        </Text>

        <Stack gap="xs">
          {indicators.map((it) => {
            const color = colorByScore(it.score);
            const lvl = levelLabel(it.score);

            return (
              <Tooltip
                key={it.key}
                label={
                  <Stack gap={2}>
                    <Text size="sm" fw={700}>
                      {it.emoji} {it.title} · {lvl}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {it.desc}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {it.detail}
                    </Text>
                  </Stack>
                }
                withArrow
                multiline
                w={isMobile ? 260 : 320}
              >
                <Card radius="md" p="sm" withBorder style={{ borderColor: 'rgba(0,0,0,0.06)', cursor: 'help' }}>
                  <Group justify="space-between" align="center" wrap="nowrap">
                    <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
                      <Text fw={800} style={{ width: 22 }}>
                        {it.emoji}
                      </Text>
                      <div style={{ minWidth: 0 }}>
                        <Text fw={700} size="sm" truncate>
                          {it.title}
                        </Text>
                        <Text size="xs" c="dimmed" truncate>
                          {it.desc}
                        </Text>
                      </div>
                    </Group>

                    <Group gap={8} wrap="nowrap">
                      <Badge variant="light" radius="xl" color={color}>
                        {lvl}
                      </Badge>
                      <Text fw={800} style={{ width: 36, textAlign: 'right' }}>
                        {Math.round(clamp01(it.score))}
                      </Text>
                    </Group>
                  </Group>

                  <Progress value={clamp01(it.score)} radius="xl" mt={8} />
                </Card>
              </Tooltip>
            );
          })}
        </Stack>
      </Card>

      {/* 근거 */}
      <Card withBorder radius="md" p="sm">
        <Group gap="xs" mb={6}>
          <IconInfoCircle size={18} />
          <Text fw={800}>근거</Text>
        </Group>

        <List spacing="xs" size="sm" center>
          {top.length ? (
            top.map((r, idx) => <List.Item key={`top-${idx}`}>{r}</List.Item>)
          ) : (
            <List.Item>표시할 근거가 없습니다.</List.Item>
          )}
        </List>

        {rest.length > 0 && (
          <>
            <Collapse in={opened}>
              <List spacing="xs" size="sm" center mt="xs">
                {rest.map((r, idx) => (
                  <List.Item key={`rest-${idx}`}>{r}</List.Item>
                ))}
              </List>
            </Collapse>

            <Group justify="center" mt="sm">
              <Button
                variant="subtle"
                size="xs"
                onClick={toggle}
                rightSection={opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              >
                {opened ? '근거 접기' : `근거 더보기 (+${rest.length})`}
              </Button>
            </Group>
          </>
        )}

        <Divider my="sm" />

        {/* ✅ diffSummary도 undefined 방어 */}
        <SimpleGrid cols={2} spacing="sm" verticalSpacing="xs">
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">
              평균 diff
            </Text>
            <Text fw={800}>{fmt(team.diffSummary?.avgDiff, 2)}</Text>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Text size="xs" c="dimmed">
              + / - 비율
            </Text>
            <Text fw={800}>
              {fmt(team.diffSummary?.overRate, 1)}% / {fmt(team.diffSummary?.underRate, 1)}%
            </Text>
          </div>
        </SimpleGrid>

        <Text size="xs" c="dimmed" mt="sm">
          * 팀전 분석은 “상대/팀원 점수”를 모르기 때문에 추정치입니다. (정확도는 표본 수에 비례)
        </Text>
      </Card>
    </Stack>
  );
}