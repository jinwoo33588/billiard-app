import React from "react";
import { Badge, Card, Divider, Group, Progress, SimpleGrid, Stack, Text } from "@mantine/core";
import type { InsightAll } from "../types";
import { clamp01, fmt, skillScore, statusMeta } from "../utils";
import HandicapPositionGauge from "./HandicapPositionGauge";
import { calcFormScore, formGrade } from "../utilsFormScore";

export default function FormCard({ all }: { all: InsightAll }) {
  const meta = statusMeta(all.status);
  const s = all.stats;

  if (!s) {
    return (
      <Card withBorder radius="md" p="sm">
        <Group justify="space-between" mb={4}>
          <Text fw={800}>폼(에버)</Text>
          <Badge variant="light" radius="xl" color={meta.color}>
            {meta.emoji} {meta.label}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">데이터가 부족합니다. (최소 5판)</Text>
      </Card>
    );
  }

  const score = skillScore(s.delta);
  const expected = all.benchmark?.expected ?? 0;
const { avgScore, winScore, total, progress } = calcFormScore({
  recentAvg: s.recentAvg,
  expectedAvg: expected,
  winRate: s.winRate,
});
const grade = formGrade(total);

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={4} wrap="nowrap">
        <Text fw={800}>폼(에버)</Text>
        <Badge variant="light" radius="xl" color={meta.color}>
          {meta.emoji} {meta.label}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">기대 에버 대비 Δ를 0~100 점수로 표시</Text>
     

<Badge variant="light" radius="xl" color={grade.color}>
  {grade.label} · {total.toFixed(1)}점
</Badge>
<Progress value={progress} mt="sm" radius="xl" />
<Text size="xs" c="dimmed" mt={6}>
  avg {avgScore.toFixed(1)} / 90 + win {winScore.toFixed(1)} / 10 = {total.toFixed(1)}
</Text>

{/* s가 있을 때 */}
<HandicapPositionGauge
  handicap={all.benchmark?.handicap ?? 0}
  recentAvg={s.recentAvg}
  winRate={s.winRate}
/>
      {/* <Progress value={clamp01(score)} mt="sm" radius="xl" /> */}

      <Divider my="sm" />

      <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">최근 Avg</Text>
          <Text fw={900} size="lg">{fmt(s.recentAvg, 3)}</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">기대 대비 Δ</Text>
          <Text fw={900} size="lg">{s.delta >= 0 ? "+" : ""}{fmt(s.delta, 3)}</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">승률(무 제외)</Text>
          <Text fw={800}>{fmt(s.winRate, 1)}%</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">기복</Text>
          <Text fw={800}>{fmt(s.volatility, 3)}</Text>
        </div>
      </SimpleGrid>

      {Array.isArray(all.reasons) && all.reasons.length > 0 && (
        <>
          <Divider my="sm" />
          <Stack gap={6}>
            {all.reasons.slice(0, 3).map((r, i) => (
              <Text key={i} size="xs" c="dimmed">• {r}</Text>
            ))}
          </Stack>
        </>
      )}
    </Card>
  );
}