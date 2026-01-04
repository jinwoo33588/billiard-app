// src/features/insights/components/SkillCard.tsx
import React from "react";
import { Badge, Card, Divider, Group, Progress, SimpleGrid, Text } from "@mantine/core";
import type { InsightAnalysis } from "../types";
import { fmt, statusMeta } from "../utils";

function clamp01(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

// delta(-0.10~+0.10) -> 0~100 (그냥 UI 점수화)
function skillScore(delta: number) {
  const v = Math.max(-0.1, Math.min(0.1, Number(delta)));
  return Math.round(((v + 0.1) / 0.2) * 100);
}

export default function SkillCard({ all }: { all: InsightAnalysis }) {
  const meta = statusMeta(all.status);

  if (!all.stats) {
    return (
      <Card withBorder radius="md" p="sm">
        <Group justify="space-between" mb={4}>
          <Text fw={700}>실력 지표</Text>
          <Badge variant="light" radius="xl" color={meta.color}>
            {meta.emoji} {meta.label}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          데이터가 부족합니다. (최소 5판)
        </Text>
      </Card>
    );
  }

  const s = all.stats;
  const score = skillScore(s.delta);

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={4}>
        <Text fw={700}>실력 지표</Text>
        <Badge variant="light" radius="xl" color={meta.color}>
          {meta.emoji} {meta.label}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        기대 에버 대비 최근 에버(Δ)를 0~100 점수로 표시
      </Text>

      <Progress value={clamp01(score)} mt="sm" radius="xl" />

      <Divider my="sm" />

      <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">최근 Avg</Text>
          <Text fw={800} size="lg">{fmt(s.recentAvg, 3)}</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">기대 대비 Δ</Text>
          <Text fw={800} size="lg">{s.delta >= 0 ? "+" : ""}{fmt(s.delta, 3)}</Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}