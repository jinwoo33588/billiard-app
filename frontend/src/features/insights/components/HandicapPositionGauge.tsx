import React, { useMemo } from "react";
import { Badge, Card, Divider, Group, Progress, SimpleGrid, Stack, Text } from "@mantine/core";
import { HANDICAP_BENCHMARKS, type HandicapBenchmark } from "../benchmarks";
import { estimateHandicapByAvg } from "../utilsHandicap";
import { calcFormScore, formGrade, estimateHandicapByScore } from "../utilsFormScore";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function fmt(n: any, d = 3) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(d);
}

export default function HandicapPositionGauge({
  handicap,
  recentAvg,
  winRate, // ✅ 추가
}: {
  handicap: number; // 내 현재 핸디
  recentAvg: number; // 최근 avg 에버
  winRate: number; // 0~100 (무 제외 승률)
}) {
  // 1) avg 기준 추정 (min/max 밴드 우선)
  const estByAvg = useMemo(() => estimateHandicapByAvg(recentAvg), [recentAvg]);

  // 2) 점수(total) 기준 추정
  const estByScore = useMemo(
    () => estimateHandicapByScore({ recentAvg, winRate }),
    [recentAvg, winRate]
  );

  // 3) 내 현재 핸디 벤치
  const cur = useMemo(
    () => HANDICAP_BENCHMARKS.find((b) => b.handicap === handicap) ?? null,
    [handicap]
  );

  // 4) 내 현재 핸디에서의 점수 계산
  const scorePack = useMemo(() => {
    const expected = cur?.expected ?? estByAvg.expected; // 없으면 avg추정 기대값으로 대체
    return calcFormScore({ recentAvg, expectedAvg: expected, winRate });
  }, [recentAvg, winRate, cur, estByAvg.expected]);

  const grade = useMemo(() => formGrade(scorePack.total), [scorePack.total]);

  // 5) 현재 핸디 밴드 내 위치(마커)
  const pos01 = useMemo(() => {
    if (!cur) return 0;
    return clamp01((recentAvg - cur.min) / (cur.max - cur.min || 1));
  }, [cur, recentAvg]);

  const expectedPos01 = useMemo(() => {
    if (!cur) return 0.5;
    return clamp01((cur.expected - cur.min) / (cur.max - cur.min || 1));
  }, [cur]);

  // 6) 주변 핸디(내 핸디 기준 -2~+2)
  const window = useMemo((): HandicapBenchmark[] => {
    const hs = [handicap - 2, handicap - 1, handicap, handicap + 1, handicap + 2];
    return hs
      .map((h) => HANDICAP_BENCHMARKS.find((b) => b.handicap === h))
      .filter((v): v is HandicapBenchmark => Boolean(v));
  }, [handicap]);

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Text fw={800}>핸디 위치</Text>
        <Badge variant="light" radius="xl" color={grade.color}>
          {grade.label} · {scorePack.total.toFixed(1)}점
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        avg점수(90) = 핸디 기대에버 대비 환산 · 승률점수(10) = 승률/10
      </Text>

      {/* ✅ 점수 Progress (70~110을 0~100으로 표시) */}
      <Progress value={scorePack.progress} mt="xs" radius="xl" />
      <Text size="xs" c="dimmed" mt={6}>
        avg {scorePack.avgScore.toFixed(1)} / 90 + win {scorePack.winScore.toFixed(1)} / 10
      </Text>

      <Divider my="sm" />

      {/* ✅ 추정 핸디 2종 */}
      <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
        <Card withBorder radius="md" p="xs">
          <Text size="xs" c="dimmed">에버 기준 추정</Text>
          <Text fw={900} size="lg">{estByAvg.handicap}점</Text>
          <Text size="xs" c="dimmed">exp {fmt(estByAvg.expected, 3)}</Text>
        </Card>
        <Card withBorder radius="md" p="xs">
          <Text size="xs" c="dimmed">점수 기준 추정</Text>
          <Text fw={900} size="lg">{estByScore.handicap}점</Text>
          <Text size="xs" c="dimmed">target 90~95</Text>
        </Card>
      </SimpleGrid>

      {/* ✅ 현재 핸디 밴드 내 위치 */}
      {cur && (
        <Card withBorder radius="md" p="sm" mt="sm">
          <Group justify="space-between" mb={6} wrap="nowrap">
            <Text size="sm" fw={700}>현재 핸디 {handicap} 밴드</Text>
            <Text size="xs" c="dimmed">
              {fmt(cur.min, 3)} ~ {fmt(cur.max, 3)}
            </Text>
          </Group>

          <div style={{ position: "relative", height: 18, borderRadius: 999, background: "#f1f3f5" }}>
            {/* 기대값 점 */}
            <div
              style={{
                position: "absolute",
                left: `${expectedPos01 * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 8,
                height: 8,
                borderRadius: 999,
                background: "#868e96",
              }}
              title="기대값(expected)"
            />
            {/* 내 위치 점 */}
            <div
              style={{
                position: "absolute",
                left: `${pos01 * 100}%`,
                top: "50%",
                transform: "translate(-50%, -50%)",
                width: 12,
                height: 12,
                borderRadius: 999,
                background: "#228be6",
                boxShadow: "0 0 0 3px rgba(34, 139, 230, 0.15)",
              }}
              title="내 위치(recentAvg)"
            />
          </div>

          <Text size="xs" c="dimmed" mt={6}>
            recentAvg {fmt(recentAvg, 3)} · expected {fmt(cur.expected, 3)}
          </Text>
        </Card>
      )}

      {/* ✅ 주변 핸디 사다리: 각 칸에 “그 핸디로 가정했을 때의 total”도 같이 표시 */}
      {window.length > 0 && (
        <Stack gap={6} mt="sm">
          <Text size="sm" fw={700}>주변 핸디 시뮬(같은 기록 기준)</Text>
          <SimpleGrid cols={Math.min(5, window.length)} spacing="xs">
            {window.map((b) => {
              const isMe = b.handicap === handicap;

              const sim = calcFormScore({
                recentAvg,
                expectedAvg: b.expected,
                winRate,
              });
              const g = formGrade(sim.total);

              return (
                <Card
                  key={b.handicap}
                  withBorder
                  radius="md"
                  p="xs"
                  style={{ background: isMe ? "#f8f9fa" : undefined }}
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