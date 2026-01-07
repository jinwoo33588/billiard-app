import React from "react";
import {
  Accordion,
  Badge,
  Card,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
} from "@mantine/core";
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
          <Accordion.Item key={g.gameId} value={String(g.gameId)}>
            <Accordion.Control>
              {/* ✅ 모바일에서 줄바꿈 허용 */}
              <Stack gap={6}>
                <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
                  <Group gap={8} wrap="wrap" style={{ minWidth: 0, flex: 1 }}>
                    <Badge variant="light" color={m.color} radius="xl">
                      {m.text}
                    </Badge>

                    {/* ✅ 긴 텍스트 안전하게: 줄바꿈/넘침 방지 */}
                    <Text
                      fw={900}
                      style={{
                        minWidth: 0,
                        wordBreak: "keep-all",
                      }}
                    >
                      {g.score}점 / {g.inning}이닝
                    </Text>
                  </Group>

                  {/* ✅ gps 배지는 오른쪽, 작아지면 아래로 내려가도 OK */}
                  <Badge
                    variant="filled"
                    color={gc}
                    radius="xl"
                    style={{ flexShrink: 0 }}
                  >
                    gps {fmt(g.gps, 1)}
                  </Badge>
                </Group>

                {/* ✅ meta 라인은 모바일에서 2줄까지 허용 */}
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.35 }}>
                  {niceDate(g.date)} · {g.gameType} · {g.result} · avg {fmt(g.avg, 3)} · vol {fmt(g.vol, 2)}
                </Text>
              </Stack>
            </Accordion.Control>

            <Accordion.Panel>
              <Card withBorder radius="md" p="sm">
                {/* ✅ base(모바일)=1열, sm 이상=2열 */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs" verticalSpacing="xs">
                  <Metric label="avg" value={fmt(g.avg, 3)} />
                  <Metric label="eff" value={`${g.eff >= 0 ? "+" : ""}${fmt(g.eff, 3)}`} />
                  <Metric label="expectedScore" value={fmt(g.expectedScore, 2)} />
                  <Metric label="vol" value={`${g.vol >= 0 ? "+" : ""}${fmt(g.vol, 2)}`} />
                  <Metric label="effScore" value={fmt(g.effScore, 1)} />
                  <Metric label="volScore" value={fmt(g.volScore, 1)} />
                </SimpleGrid>

                <Divider my="sm" />
                <Text size="xs" c="dimmed" style={{ lineHeight: 1.35 }}>
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Group
      justify="space-between"
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        border: "1px solid var(--mantine-color-gray-3)",
      }}
    >
      <Text size="xs" c="dimmed">{label}</Text>
      <Text fw={800}>{value}</Text>
    </Group>
  );
}