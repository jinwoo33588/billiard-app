// src/features/insights/components/TeamLuckCard.tsx
import React from "react";
import { Badge, Card, Divider, Group, Progress, SimpleGrid, Text } from "@mantine/core";
import type { TeamIndicators } from "../types";
import { fmt } from "../utils";

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp01(v: any) {
  return Math.max(0, Math.min(100, num(v, 0)));
}

function mainLabel(team: TeamIndicators) {
  if (num(team.sampleN) < 5) return "표본 부족(보류)";
  const { luckBadScore, busScore, carryScore, selfIssueScore } = team.weighted;

  const arr = [
    { k: "bad", v: luckBadScore, label: "팀운(억울) 성향" },
    { k: "bus", v: busScore, label: "버스 성향" },
    { k: "carry", v: carryScore, label: "캐리 성향" },
    { k: "self", v: selfIssueScore, label: "내 이슈 성향" },
  ].sort((a, b) => b.v - a.v);

  if (arr[0].v < 18) return "팀전 흐름이 비교적 균형적";
  return arr[0].label;
}

export default function TeamLuckCard({ team }: { team: TeamIndicators }) {
  const n = num(team.sampleN);

  const impact = n < 5
    ? 0
    : Math.round(
        clamp01(team.weighted.luckBadScore) * 0.7 +
        clamp01(team.weighted.busScore) * 0.3
      ); // “팀운/버스 영향도” 느낌의 단일 바(가벼운 요약)

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={4}>
        <Text fw={700}>팀전 지표</Text>
        <Badge variant="light" radius="xl" color={n >= 5 ? "blue" : "gray"}>
          표본 {n}판(승/패)
        </Badge>
      </Group>

      {n < 5 ? (
        <Text size="sm" c="dimmed">팀전 표본이 부족해요. (승/패 기준 최소 5판)</Text>
      ) : (
        <>
          <Text fw={800}>{mainLabel(team)}</Text>
          <Text size="xs" c="dimmed">
            diff = (내 점수 score) - (내 핸디 handicap), +는 “할만큼(이상)”
          </Text>

          <Progress value={impact} mt="sm" radius="xl" />

          <Divider my="sm" />

          <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">억울(잘했는데 패)</Text>
              <Text fw={800} size="lg">{fmt(team.rates.teamLuckBadRate, 0)}%</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">버스(못했는데 승)</Text>
              <Text fw={800} size="lg">{fmt(team.rates.busRate, 0)}%</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">내 이슈(못했는데 패)</Text>
              <Text fw={800} size="lg">{fmt(team.rates.selfIssueRate, 0)}%</Text>
            </div>
            <div style={{ textAlign: "center" }}>
              <Text size="xs" c="dimmed">캐리(잘해서 승)</Text>
              <Text fw={800} size="lg">{fmt(team.rates.carryRate, 0)}%</Text>
            </div>
          </SimpleGrid>

          <Text size="xs" c="dimmed" mt="sm">
            평균 diff {fmt(team.diffSummary.avgDiff, 2)} · +비율 {fmt(team.diffSummary.overRate, 0)}%
          </Text>
        </>
      )}
    </Card>
  );
}