import React from "react";
import { Badge, Card, Divider, Group, SimpleGrid, Text } from "@mantine/core";
import type { TeamIndicators } from "../types";
import { fmt, fmt0 } from "../utils";

export default function TeamSummaryCard({ team }: { team: TeamIndicators }) {
  const n = team?.sampleN ?? 0;

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={4}>
        <Text fw={800}>팀전 인사이트</Text>
        <Badge variant="light" radius="xl" color={n >= 5 ? "blue" : "gray"}>
          표본 {n}판(승/패)
        </Badge>
      </Group>

      <Text fw={800}>{team.headline}</Text>
      <Text size="xs" c="dimmed" mt={4}>
        gps = 0.6*effScore + 0.4*volScore · gps≥60 잘침 · gps≤40 못침
      </Text>

      <Divider my="sm" />

      <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">🎲 억울</Text>
          <Text fw={900} size="lg">{fmt0(team.rates.luckBadRate)}%</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">🚌 버스</Text>
          <Text fw={900} size="lg">{fmt0(team.rates.busRate)}%</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">🧊 내 이슈</Text>
          <Text fw={900} size="lg">{fmt0(team.rates.selfIssueRate)}%</Text>
        </div>
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">🔥 캐리</Text>
          <Text fw={900} size="lg">{fmt0(team.rates.carryRate)}%</Text>
        </div>
      </SimpleGrid>

      {team.cuts && (
        <Text size="xs" c="dimmed" mt="sm">
          컷(p05~p95) · eff {fmt(team.cuts.eff.p05, 3)}~{fmt(team.cuts.eff.p95, 3)} · vol {fmt(team.cuts.vol.p05, 2)}~{fmt(team.cuts.vol.p95, 2)}
        </Text>
      )}
    </Card>
  );
}