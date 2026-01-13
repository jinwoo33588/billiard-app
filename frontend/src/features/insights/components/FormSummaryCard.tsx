// frontend/src/features/insights/components/FormSummaryCard.tsx
import React from "react";
import { Badge, Card, Divider, Group, Stack, Text } from "@mantine/core";
import type { InsightAll } from "../types";
import { fmt, fmt1 } from "../utils/format";

export default function FormSummaryCard({ all }: { all: InsightAll }) {
  const bench = all.benchmark;
  const st = all.stats;

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Text fw={900}>최근 폼</Text>
        <Badge radius="xl" variant="light">
          exp {fmt(bench?.expected, 3)}
        </Badge>
      </Group>

      {!st ? (
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            데이터가 부족합니다.
          </Text>
          {all.reasons?.map((r, i) => (
            <Text key={i} size="xs" c="dimmed">
              • {r}
            </Text>
          ))}
        </Stack>
      ) : (
        <>
          <Text size="xs" c="dimmed">
            표본 {st.sampleN}판 · 기대 에버 대비 Δ {fmt(st.delta, 3)}
          </Text>

          <Divider my="sm" />

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              recentAvg
            </Text>
            <Text fw={800}>{fmt(st.recentAvg, 3)}</Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              winRate
            </Text>
            <Text fw={800}>{fmt1(st.winRate)}%</Text>
          </Group>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              volatility
            </Text>
            <Text fw={800}>{fmt(st.volatility, 3)}</Text>
          </Group>
        </>
      )}
    </Card>
  );
}