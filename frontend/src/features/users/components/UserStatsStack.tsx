// frontend/src/features/users/components/UserStatsStack.tsx
import { Card, Group, Text, Badge, Divider, SimpleGrid } from "@mantine/core";
import type { StatsSummary } from "../types";
import { fmt3, fmtPct } from "../../../shared/utils/number";

function StatsCard({ title, badge, stats }: { title: string; badge: string; stats: StatsSummary }) {
  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{ background: "rgba(255,255,255,0.9)", borderColor: "rgba(0,0,0,0.08)" }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3, lineHeight: 1.1 }}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
            {stats.gamesCount}판 · 총 {stats.sums.score}점 / {stats.sums.inning}이닝
          </Text>
        </div>

        <Badge radius="xl" variant="light" style={{ fontWeight: 900, border: "1px solid rgba(0,0,0,0.08)" }}>
          {badge}
        </Badge>
      </Group>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
        <div>
          <Text size="xs" c="dimmed" fw={900}>
            승률
          </Text>
          <Text fw={950} style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmtPct(stats.winRate, 1, "-")}%
          </Text>
        </div>

        <div>
          <Text size="xs" c="dimmed" fw={900}>
            AVG
          </Text>
          <Text fw={950} style={{ fontVariantNumeric: "tabular-nums" }}>
            {fmt3(stats.avg)}
          </Text>
        </div>
      </SimpleGrid>
    </Card>
  );
}

export default function UserStatsStack({
  all,
  thisMonth,
  recent,
  recentN,
}: {
  all: StatsSummary;
  thisMonth: StatsSummary;
  recent: StatsSummary;
  recentN: number;
}) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <StatsCard title="전체" badge="ALL" stats={all} />
      <StatsCard title="이번달" badge="MONTH" stats={thisMonth} />
      <StatsCard title="최근" badge={`최근 ${recentN}판`} stats={recent} />
    </div>
  );
}
