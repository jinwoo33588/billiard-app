// /Users/gimjin-u/my-billiard-app/frontend/src/features/stats/components/StatsOverview.tsx
import React from "react";
import {
  Card,
  Title,
  Text,
  Group,
  Badge,
  Divider,
  Stack,
  SimpleGrid,
  Center,
  Loader,
} from "@mantine/core";

import { useMyStats } from "../useMyStats";

function winRateColor(winRateNum: number) {
  return winRateNum >= 66 ? "green" : winRateNum >= 60 ? "blue" : winRateNum >= 30 ? "orange" : "red";
}

function glassBadgeStyle(color: string) {
  return {
    background: "rgba(255,255,255,0.75)",
    color,
    border: "1px solid rgba(0,0,0,0.06)",
  } as const;
}

function formatYYMM(now: Date) {
  const yy = String(now.getFullYear()).slice(2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${yy}.${mm}`;
}

function StatsBlock({
  label,
  subtitle,
  stats,
  accent,
}: {
  label: string;
  subtitle: string;
  stats: {
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
    totalInnings: number;
    winRate: number;  // number
    average: number;  // number
  };
  accent: string;
}) {
  const color = winRateColor(stats.winRate);

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        background: "rgba(255,255,255,0.65)",
        borderColor: "rgba(0,0,0,0.06)",
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text fw={900} style={{ lineHeight: 1.1 }}>
              {label}
            </Text>
            <Badge radius="xl" size="sm" variant="light" style={{ border: "1px solid rgba(0,0,0,0.06)" }}>
              {stats.totalGames}판
            </Badge>
          </Group>
          <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
            {subtitle}
          </Text>
        </div>

        <Badge radius="xl" size="sm" variant="filled" style={{ background: accent, color: "white" }}>
          KPI
        </Badge>
      </Group>

      <Divider my="xs" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
        {/* 승률 */}
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">승률</Text>

          <Group justify="center" gap={6} align="baseline" mt={8} wrap="nowrap">
            <Text
              size="xl"
              fw={900}
              style={{
                lineHeight: 1,
                color: `var(--mantine-color-${color}-7)`,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {stats.winRate.toFixed(1)}
            </Text>
            <Text size="sm" c="dimmed">%</Text>
          </Group>

          <Group justify="center" gap={6} mt={10} wrap="wrap">
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-green-7)")}>
              {stats.wins}승
            </Badge>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-gray-7)")}>
              {stats.draws}무
            </Badge>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-red-7)")}>
              {stats.losses}패
            </Badge>
          </Group>
        </div>

        {/* 에버 */}
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">에버</Text>

          <Text
            size="xl"
            fw={900}
            mt={8}
            style={{
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {stats.average.toFixed(3)}
          </Text>

          <Group justify="center" mt={10}>
            <Badge radius="xl" variant="light" size="sm" style={glassBadgeStyle("var(--mantine-color-gray-7)")}>
              총 {stats.totalInnings}이닝
            </Badge>
          </Group>
        </div>
      </SimpleGrid>
    </Card>
  );
}

export default function StatsOverview() {
  // ✅ 전체 통계
  const allQ = useMyStats({ selector: { type: "all" } });

  // ✅ 이번달 통계 (백엔드 selector 사용)
  const monthQ = useMyStats({ selector: { type: "thisMonth" } });

  const now = new Date();
  const monthLabel = formatYYMM(now);

  const loading = allQ.loading || monthQ.loading;

  if (loading) {
    return (
      <Center style={{ minHeight: 120 }}>
        <Loader size="sm" />
      </Center>
    );
  }

  if (allQ.errorMsg || monthQ.errorMsg) {
    return (
      <Card withBorder radius="md" p="sm">
        <Text c="red" fw={700}>통계를 불러오지 못했습니다.</Text>
        <Text size="sm" c="dimmed">
          {allQ.errorMsg || monthQ.errorMsg}
        </Text>
      </Card>
    );
  }

  const all = allQ.data?.stats;
  const month = monthQ.data?.stats;

  // 백엔드가 비어있을 수도 있으니 방어
  if (!all || !month) {
    return (
      <Card withBorder radius="md" p="sm">
        <Text c="dimmed">표시할 통계가 없습니다.</Text>
      </Card>
    );
  }

  return (
    <Stack gap="sm">
      <StatsBlock
        label="전체"
        subtitle="모든 기록 기준"
        stats={all}
        accent="var(--mantine-color-blue-6)"
      />
      <StatsBlock
        label="이번 달"
        subtitle={`${monthLabel} 기준 (0판이어도 표시)`}
        stats={month}
        accent="var(--mantine-color-teal-6)"
      />
    </Stack>
  );
}