// frontend/src/features/insights/components/TeamInsightsSection.tsx
import React, { useMemo, useState } from "react";
import { Card, Group, SegmentedControl, Stack, Text, Badge } from "@mantine/core";
import type { TeamInsights } from "../types";
import TeamGameCard from "./TeamGameCard";

type Filter = "ALL" | "WIN" | "LOSE";

export default function TeamInsightsSection({ team }: { team: TeamInsights }) {
  const [filter, setFilter] = useState<Filter>("ALL");

  const games = team?.games ?? [];
  const filtered = useMemo(() => {
    if (filter === "ALL") return games;
    return games.filter((g) => g.result === filter);
  }, [games, filter]);

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
        <Stack gap={2} style={{ minWidth: 0 }}>
          <Text fw={900}>팀전 GPS</Text>
          <Text size="xs" c="dimmed" lineClamp={1}>
            표본 {team.sampleN}판 · 핸디 {team.benchmark?.handicap} · exp {team.benchmark?.expected}
          </Text>
        </Stack>

        <SegmentedControl
          size="xs"
          value={filter}
          onChange={(v) => setFilter(v as Filter)}
          data={[
            { label: "전체", value: "ALL" },
            { label: "승", value: "WIN" },
            { label: "패", value: "LOSE" },
          ]}
        />
      </Group>

      {team.note && (
        <Badge radius="xl" variant="light" color="gray" mb="sm">
          {team.note}
        </Badge>
      )}

      <Stack gap={8}>
        {filtered.length === 0 ? (
          <Text size="sm" c="dimmed">
            표시할 팀전 기록이 없어요.
          </Text>
        ) : (
          filtered.map((g) => <TeamGameCard key={g.gameId} g={g} />)
        )}
      </Stack>
    </Card>
  );
}