// frontend/src/features/insights/components/TeamGameCard.tsx
import React, { useState } from "react";
import { Badge, Card, Divider, Group, Stack, Text, Collapse, ActionIcon } from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import type { TeamGameRow } from "../types";
import { fmt, fmt1, toLocalDateTime } from "../utils/format";

function gpsColor(gps: number) {
  if (!Number.isFinite(gps)) return "gray";
  if (gps >= 80) return "teal";
  if (gps >= 65) return "green";
  if (gps >= 50) return "yellow";
  if (gps >= 35) return "orange";
  return "red";
}

export default function TeamGameCard({ g }: { g: TeamGameRow }) {
  const [open, setOpen] = useState(false);

  const c = gpsColor(g.gps);

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap={4} style={{ minWidth: 0 }}>
          <Group gap={6}>
            <Badge size="xs" variant="light">
              {g.gameType}
            </Badge>
            <Badge size="xs" variant="light" color={g.result === "WIN" ? "teal" : "red"}>
              {g.result}
            </Badge>
          </Group>

          <Text size="xs" c="dimmed" lineClamp={1}>
            {toLocalDateTime(g.date)}
          </Text>

          <Text size="sm">
            {g.score}점 · {g.inning}이닝
          </Text>

          <Text size="xs" c="dimmed">
            effScore {fmt1(g.effScore)} · volScore {fmt1(g.volScore)}
          </Text>
        </Stack>

        <Stack gap={6} align="flex-end">
          <Badge radius="xl" variant="filled" color={c}>
            GPS {fmt1(g.gps)}
          </Badge>

          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => setOpen((v) => !v)}
            aria-label="toggle detail"
          >
            {open ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
          </ActionIcon>
        </Stack>
      </Group>

      <Collapse in={open}>
        <Divider my="sm" />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            avg
          </Text>
          <Text size="xs">{fmt(g.avg, 3)}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            eff
          </Text>
          <Text size="xs">{fmt(g.eff, 3)}</Text>
        </Group>

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            vol
          </Text>
          <Text size="xs">{fmt(g.vol, 3)}</Text>
        </Group>

        <Divider my="sm" />

        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            weights
          </Text>
          <Text size="xs">
            eff {fmt(g.weights?.eff, 3)} · vol {fmt(g.weights?.vol, 3)}
          </Text>
        </Group>
      </Collapse>
    </Card>
  );
}