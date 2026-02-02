import { Card, Group, Text, Badge, Divider, SimpleGrid } from "@mantine/core";
import Metric from "../../../shared/components/Metric";
import { fmt0, fmt1, fmt3, fmtPct, fmtInt } from "../../../shared/utils/number";
import type { StatsSummary } from "../../stats/types";

type Props = {
  stats: StatsSummary | null;
  loading?: boolean;
  from?: string;
  to?: string;
};

function rangeLabel(from?: string, to?: string) {
  if (from && to) return `${from} ~ ${to}`;
  if (from && !to) return `${from} ~`;
  if (!from && to) return `~ ${to}`;
  return "전체";
}

export default function GamePeriodStatsCard({ stats, loading = false, from, to }: Props) {
  const winRate = stats ? fmtPct(stats.winRate, 1, "-") : "-";
  const expectedWinRate = stats ? fmtPct(stats.expectedWinRate, 1, "-") : "-";
  const avg = stats ? fmt3(stats.avg, "-") : "-";
  const bestScore = stats ? fmt0(stats.bestScore, "-") : "-";

  const gamesCount = stats?.gamesCount ?? 0;
  const wins = stats?.wins ?? 0;
  const draws = stats?.draws ?? 0;
  const loses = stats?.loses ?? 0;
  const totalScore = stats?.sums?.score ?? 0;
  const totalInning = stats?.sums?.inning ?? 0;
  const bestAvg = stats?.bestAvg ?? 0;

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{ background: "rgba(255,255,255,0.92)", borderColor: "rgba(0,0,0,0.08)" }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={900} style={{ letterSpacing: -0.3, lineHeight: 1.1 }}>
            기간 통계
          </Text>
          <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
            {rangeLabel(from, to)}
          </Text>
        </div>
        <Badge radius="xl" variant="light" style={{ border: "1px solid rgba(0,0,0,0.08)" }}>
          {fmtInt(gamesCount)}판
        </Badge>
      </Group>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      {loading ? (
        <Text size="sm" c="dimmed">
          Loading...
        </Text>
      ) : (
        <>
          <SimpleGrid cols={3} spacing="sm" verticalSpacing="sm">
            <div style={{ textAlign: "center" }}>
              <Metric label="승률" value={winRate} suffix="%" strong align="center" />
              <Text size="xs" c="dimmed" fw={800} mt={4}>
                기대승률 {expectedWinRate}%
              </Text>
            </div>
            <Metric label="AVG" value={avg} strong align="center" />
            <Metric label="최고점" value={bestScore} suffix="점" strong align="center" />
          </SimpleGrid>

          <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

          <Group justify="space-between" align="center" wrap="wrap" gap={8}>
            <Text size="sm" fw={800} c="dimmed">
              {wins}승 · {draws}무 · {loses}패
            </Text>
            <Text size="sm" fw={800} c="dimmed">
              최고 AVG {fmt1(bestAvg)} 
            </Text>
          </Group>
        </>
      )}
    </Card>
  );
}
