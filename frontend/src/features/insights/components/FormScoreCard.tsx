// frontend/src/features/insights/components/FormScoreCard.tsx
import React, { useMemo } from "react";
import { Badge, Card, Divider, Group, Progress, SimpleGrid, Stack, Text } from "@mantine/core";
import type { InsightAll } from "../types";
import type { HandicapBenchmark } from "../../meta/types";
import { calcFormScore, formGrade, estimateHandicapByFormScore } from "../utils/formScore";

function fmt(n: unknown, d = 3) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(d) : "-";
}

export default function FormScoreCard({
  all,
  rows,              // meta handicap benchmarks (optional)
  showSim = true,     // 주변 핸디 시뮬 보여줄지
}: {
  all: InsightAll;
  rows: HandicapBenchmark[] | null;
  showSim?: boolean;
}) {
  const st = all.stats;

  // 데이터 부족
  if (!st || !all.benchmark) {
    return (
      <Card withBorder radius="md" p="sm">
        <Text fw={900}>Form Score (90+10)</Text>
        <Text size="sm" c="dimmed" mt={6}>
          데이터가 부족합니다.
        </Text>
      </Card>
    );
  }

  const myH = Number(all.benchmark.handicap);
  const expected = Number(all.benchmark.expected);

  const pack = useMemo(() => {
    return calcFormScore({
      recentAvg: st.recentAvg,
      expectedAvg: expected,
      winRate: st.winRate,
    });
  }, [st.recentAvg, st.winRate, expected]);

  const grade = useMemo(() => formGrade(pack.total), [pack.total]);

  // (옵션) total 90~95에 가장 가까운 핸디 추정(참고용)
  const suggested = useMemo(() => {
    if (!rows) return null;
    return estimateHandicapByFormScore({
      recentAvg: st.recentAvg,
      winRate: st.winRate,
      rows,
      target: 92.5,
    });
  }, [rows, st.recentAvg, st.winRate]);

  // 주변 핸디(±2) 시뮬
  const windowRows = useMemo(() => {
    if (!rows?.length) return [];
    const hs = [myH - 2, myH - 1, myH, myH + 1, myH + 2].map((x) => Math.round(x));
    return hs
      .map((h) => rows.find((r) => r.handicap === h))
      .filter((v): v is HandicapBenchmark => Boolean(v));
  }, [rows, myH]);

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Text fw={900}>Form Score</Text>
        <Badge variant="light" radius="xl" color={grade.color}>
          {grade.label} · {pack.total.toFixed(1)}점
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        avgScore = 90 × (recentAvg / expected) · winScore = winRate/10
      </Text>

      <Progress value={pack.progress} mt="xs" radius="xl" />
      <Text size="xs" c="dimmed" mt={6}>
        avg {pack.avgScore.toFixed(1)} / 90 · win {pack.winScore.toFixed(1)} / 10
      </Text>

      <Divider my="sm" />

      <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
        <Card withBorder radius="md" p="xs">
          <Text size="xs" c="dimmed">내 핸디</Text>
          <Text fw={900} size="lg">{Math.round(myH)}점</Text>
          <Text size="xs" c="dimmed">exp {fmt(expected, 3)}</Text>
        </Card>

        <Card withBorder radius="md" p="xs">
          <Text size="xs" c="dimmed">recent</Text>
          <Text fw={900} size="lg">{fmt(st.recentAvg, 3)}</Text>
          <Text size="xs" c="dimmed">win {st.winRate.toFixed(1)}%</Text>
        </Card>
      </SimpleGrid>

      {/* 참고용: formScore로 추정한 “중립 핸디” */}
      {suggested && (
        <Badge mt="sm" radius="xl" variant="light" color="gray">
          참고: target 92.5 기준 추정 핸디 {suggested.suggested.handicap} (dist {suggested.bestDist.toFixed(2)})
        </Badge>
      )}

      {/* 주변 핸디 시뮬 */}
      {showSim && windowRows.length > 0 && (
        <Stack gap={6} mt="sm">
          <Text size="sm" fw={700}>주변 핸디 시뮬 (같은 기록 기준)</Text>
          <SimpleGrid cols={Math.min(5, windowRows.length)} spacing="xs">
            {windowRows.map((b) => {
              const sim = calcFormScore({
                recentAvg: st.recentAvg,
                expectedAvg: b.expected,
                winRate: st.winRate,
              });
              const g = formGrade(sim.total);
              const isMe = b.handicap === Math.round(myH);

              return (
                <Card
                  key={b.handicap}
                  withBorder
                  radius="md"
                  p="xs"
                  style={{ background: isMe ? "var(--mantine-color-gray-0)" : undefined }}
                >
                  <Group justify="space-between" gap={6} wrap="nowrap">
                    <Text fw={900}>{b.handicap}</Text>
                    {isMe && <Badge size="xs" variant="light">나</Badge>}
                  </Group>

                  <Text size="xs" c="dimmed" mt={4}>
                    exp {fmt(b.expected, 3)}
                  </Text>

                  <Badge mt={6} size="xs" variant="light" color={g.color}>
                    {sim.total.toFixed(1)}점
                  </Badge>
                </Card>
              );
            })}
          </SimpleGrid>
        </Stack>
      )}
    </Card>
  );
}