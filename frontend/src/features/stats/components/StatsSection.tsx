// frontend/src/features/stats/components/StatsBlock.tsx
import React from "react";
import {
  Card,
  Text,
  Group,
  Badge,
  Divider,
  SimpleGrid,
  Center,
  Loader,
} from "@mantine/core";
import type { StatsSummary } from "../types";

function glassBadgeStyle(color: string) {
  return {
    background: "rgba(255,255,255,0.75)",
    color,
    border: "1px solid rgba(0,0,0,0.06)",
  } as const;
}

function fmtInt(n: number) {
  return new Intl.NumberFormat("ko-KR").format(n);
}

function fmt3(n: number) {
  return Number.isFinite(n) ? n.toFixed(3) : "0.000";
}

function pct0to100_1(n0to1: number) {
  const v = Number.isFinite(n0to1) ? n0to1 * 100 : 0;
  return v.toFixed(1);
}

type Props = {
  title: string;                 // "전체" / "이번달" / "최근 10게임"
  subtitle?: string;             // "이번달(현재까지)" 등
  stats: StatsSummary | null;    // 로딩 전엔 null 가능
  loading?: boolean;
};

export default function StatsSection({ title, subtitle, stats, loading = false }: Props) {
  const gamesCount = stats?.gamesCount ?? 0;

  // ✅ 승률은 "무 제외" 기준 (서버의 winRate 사용)
  const winRate = stats ? pct0to100_1(stats.winRate) : "0.0";

  const wins = stats?.wins ?? 0;
  const draws = stats?.draws ?? 0;
  const loses = stats?.loses ?? 0;

  const avg = stats ? fmt3(stats.avg) : "0.000";
  const totalInning = stats?.sums?.inning ?? 0;

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
      {/* 헤더 */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Group gap={8} wrap="nowrap">
            <Text fw={900} style={{ lineHeight: 1.1 }}>
              {title}
            </Text>

            <Badge
              radius="xl"
              size="sm"
              variant="light"
              style={{ border: "1px solid rgba(0,0,0,0.06)" }}
            >
              {fmtInt(gamesCount)}판
            </Badge>
          </Group>

          {subtitle ? (
            <Text size="xs" c="dimmed" mt={2} lineClamp={1}>
              {subtitle}
            </Text>
          ) : null}
        </div>

        {/* 오른쪽 상단: 로딩 표시(원하면 제거 가능) */}
        {loading ? (
          <Center>
            <Loader size="xs" />
          </Center>
        ) : null}
      </Group>

      <Divider my="xs" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      {/* 본문 */}
      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
        {/* 승률 */}
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">
            승률
          </Text>

          <Group justify="center" gap={6} align="baseline" mt={8} wrap="nowrap">
            <Text
              size="xl"
              fw={900}
              style={{
                lineHeight: 1,
                // ✅ Mantine theme color 사용 (원하면 고정색으로 바꿔도 됨)
                color: "var(--mantine-color-blue-7)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {winRate}
            </Text>
            <Text size="sm" c="dimmed">
              %
            </Text>
          </Group>

          <Group justify="center" gap={6} mt={10} wrap="wrap">
            <Badge
              radius="xl"
              variant="light"
              size="sm"
              style={glassBadgeStyle("var(--mantine-color-green-7)")}
            >
              {fmtInt(wins)}승
            </Badge>

            <Badge
              radius="xl"
              variant="light"
              size="sm"
              style={glassBadgeStyle("var(--mantine-color-gray-7)")}
            >
              {fmtInt(draws)}무
            </Badge>

            <Badge
              radius="xl"
              variant="light"
              size="sm"
              style={glassBadgeStyle("var(--mantine-color-red-7)")}
            >
              {fmtInt(loses)}패
            </Badge>
          </Group>
        </div>

        {/* 에버 */}
        <div style={{ textAlign: "center" }}>
          <Text size="xs" c="dimmed">
            AVG
          </Text>

          <Text
            size="xl"
            fw={900}
            mt={8}
            style={{
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {avg}
          </Text>

          <Group justify="center" mt={10}>
            <Badge
              radius="xl"
              variant="light"
              size="sm"
              style={glassBadgeStyle("var(--mantine-color-gray-7)")}
            >
              총 {fmtInt(totalInning)}이닝
            </Badge>
          </Group>
        </div>
      </SimpleGrid>
    </Card>
  );
}