import { Card, Group, SimpleGrid, Text } from "@mantine/core";
import type { SummaryStats } from "../dashboard.types";

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card withBorder radius="md" p="sm">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text fw={800} size="xl">
        {value}
      </Text>
      {sub ? (
        <Text size="xs" c="dimmed">
          {sub}
        </Text>
      ) : null}
    </Card>
  );
}

function fmt3(n: number) {
  return Number.isFinite(n) ? n.toFixed(3) : "0.000";
}
function fmt1(n: number) {
  return Number.isFinite(n) ? n.toFixed(1) : "0.0";
}

export default function DashboardKpis({
  recent,
  thisMonth,
}: {
  recent: SummaryStats & { window?: number };
  thisMonth: SummaryStats;
}) {
  return (
    <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
      <KpiCard
        label={`최근 ${recent.window ?? ""} 평균`}
        value={fmt3(recent.average)}
        sub={`승률 ${fmt1(recent.winRate)}% · ${recent.totalGames}판`}
      />
      <KpiCard
        label={`최근 ${recent.window ?? ""} 변동성`}
        value={fmt3(recent.volatility)}
        sub={`베스트 avg ${fmt3(recent.bestAverage)}`}
      />
      <KpiCard
        label="이번달 평균"
        value={fmt3(thisMonth.average)}
        sub={`승률 ${fmt1(thisMonth.winRate)}% · ${thisMonth.totalGames}판`}
      />
      <KpiCard
        label="이번달 변동성"
        value={fmt3(thisMonth.volatility)}
        sub={`베스트 점수 ${thisMonth.bestScore}`}
      />
    </SimpleGrid>
  );
}
