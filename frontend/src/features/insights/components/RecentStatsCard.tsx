// frontend/src/features/insights/components/RecentStatsCard.tsx
import { Group, Badge, Divider, SimpleGrid, Text } from "@mantine/core";
import type { StatsSummary } from "../types";
import InsightCardShell from "./InsightCardShell";
import Metric from "../../../shared/components/Metric";
import Pill from "../../../shared/components/Pill";
import { fmt3, fmtPct } from "../../../shared/utils/number";

export default function RecentStatsCard({ stats }: { stats: StatsSummary }) {
  const winRatePct = Math.round((stats.winRate ?? 0) * 100);

  return (
    <InsightCardShell>
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}> 
          <Badge radius="xl" variant="light" style={{ fontWeight: 900, border: "1px solid rgba(0,0,0,0.08)" }}>
          {stats.mode === "limit" ? `최근 ${stats.limit ?? "-"}판` : stats.mode === "range" ? "기간" : "전체"}
          </Badge>
          {/* <Text fw={950} style={{ letterSpacing: -0.3, lineHeight: 1.1 }}>
            {title}
          </Text> */}
          {/* <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
            {stats.gamesCount}판 · 총 {stats.sums.score}점 / {stats.sums.inning}이닝 · 베스트 {stats.bestScore}점
          </Text> */}
        </div>

       
      </Group>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
  {/* ✅ 왼쪽: 승률 + (승/무/패) */}
  <div style={{ textAlign: "center" }}>
    <Metric label="승률" value={`${winRatePct}`} suffix="%" strong />
    <Text size="xs" c="dimmed" fw={800} mt={4}>
      기대승률 {fmtPct(stats.expectedWinRate, 1, "-")}%
    </Text>

    {/* 승/무/패 pill을 승률 아래에 작게 */}
    <Group justify="center" gap={6} mt={8} wrap="wrap">
      <Pill label="승" value={stats.wins} color="var(--mantine-color-green-7)" size="xs" />
      <Pill label="무" value={stats.draws} color="var(--mantine-color-gray-7)" size="xs" />
      <Pill label="패" value={stats.loses} color="var(--mantine-color-red-7)" size="xs" />
    </Group>
  </div>

  {/* ✅ 오른쪽: AVG */}
  <Metric label="AVG" value={fmt3(stats.avg)} strong />
</SimpleGrid>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <Group gap={8} wrap="wrap">
        <Pill label="승" value={stats.wins} color="var(--mantine-color-green-7)" />
        <Pill label="무" value={stats.draws} color="var(--mantine-color-gray-7)" />
        <Pill label="패" value={stats.loses} color="var(--mantine-color-red-7)" />
      </Group>
    </InsightCardShell>
  );
}
