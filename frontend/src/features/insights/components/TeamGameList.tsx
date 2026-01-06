import React from "react";
import { Accordion, Badge, Card, Divider, Group, SimpleGrid, Text } from "@mantine/core";
import type { TeamGameRow } from "../types";
import { fmt, gpsColor, labelMeta, niceDate } from "../utils";

export default function TeamGameList({ games }: { games: TeamGameRow[] }) {
  if (!games?.length) {
    return (
      <Card withBorder radius="md" p="sm">
        <Text size="sm" c="dimmed">팀전 기록이 없어요.</Text>
      </Card>
    );
  }

  return (
    <Accordion variant="separated" radius="md">
      {games.map((g) => {
        const m = labelMeta(g.label);
        const gc = gpsColor(g.gps);

        return (
          <Accordion.Item key={g.gameId} value={g.gameId}>
            <Accordion.Control>
              <Group justify="space-between" wrap="nowrap" gap="xs">
                <Group gap={8} wrap="nowrap">
                  <Badge variant="light" color={m.color} radius="xl">{m.text}</Badge>
                  <Text fw={900}>{g.score}점 / {g.inning}이닝</Text>
                </Group>
                <Badge variant="filled" color={gc} radius="xl">
                  gps {fmt(g.gps, 1)}
                </Badge>
              </Group>

              <Text size="xs" c="dimmed" mt={6}>
                {niceDate(g.date)} · {g.gameType} · {g.result} · avg {fmt(g.avg, 3)} · vol {fmt(g.vol, 2)}
              </Text>
            </Accordion.Control>

            <Accordion.Panel>
              <Card withBorder radius="md" p="sm">
                <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
                  <div style={{ textAlign: "center" }}>
                    <Text size="xs" c="dimmed">avg</Text>
                    <Text fw={800}>{fmt(g.avg, 3)}</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text size="xs" c="dimmed">eff</Text>
                    <Text fw={800}>{g.eff >= 0 ? "+" : ""}{fmt(g.eff, 3)}</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text size="xs" c="dimmed">expectedScore</Text>
                    <Text fw={800}>{fmt(g.expectedScore, 2)}</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text size="xs" c="dimmed">vol</Text>
                    <Text fw={800}>{g.vol >= 0 ? "+" : ""}{fmt(g.vol, 2)}</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text size="xs" c="dimmed">effScore</Text>
                    <Text fw={800}>{fmt(g.effScore, 1)}</Text>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <Text size="xs" c="dimmed">volScore</Text>
                    <Text fw={800}>{fmt(g.volScore, 1)}</Text>
                  </div>
                </SimpleGrid>

                <Divider my="sm" />
                <Text size="xs" c="dimmed">
                  gps = 0.6*effScore + 0.4*volScore · (≥60 잘침 / ≤40 못침)
                </Text>
              </Card>
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}