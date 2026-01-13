// frontend/src/features/games/components/GameRowDetail.tsx
import React from "react";
import { Card, Divider, Group, Stack, Text, Badge } from "@mantine/core";

function fmt(n: any, d = 1) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(d);
}

export type GameRowDetailData = {
  gps?: number;
  expectedScore?: number; // 기대득점
  memo?: string | null;
};

export default function GameRowDetail({ detail }: { detail: GameRowDetailData }) {
  const memo = (detail.memo ?? "").trim();

  return (
    <Card withBorder radius="md" p="sm" style={{ background: "rgba(0,0,0,0.02)" }}>
      <Stack gap={8}>
        <Group justify="space-between" wrap="nowrap">
          <Text size="xs" c="dimmed">GPS</Text>
          <Badge radius="xl" variant="filled">
            {fmt(detail.gps, 1)}
          </Badge>
        </Group>

        <Group justify="space-between" wrap="nowrap">
          <Text size="xs" c="dimmed">기대득점</Text>
          <Text size="sm" fw={800} style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt(detail.expectedScore, 1)}
          </Text>
        </Group>

        <Divider />

        <div>
          <Text size="xs" c="dimmed" mb={6}>메모</Text>
          {memo ? (
            <Text size="sm" style={{ whiteSpace: "pre-wrap" }}>
              {memo}
            </Text>
          ) : (
            <Text size="sm" c="dimmed">
              메모 없음
            </Text>
          )}
        </div>
      </Stack>
    </Card>
  );
}