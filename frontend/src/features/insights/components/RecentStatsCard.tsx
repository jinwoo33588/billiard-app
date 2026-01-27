// frontend/src/features/insights/components/RecentStatsCard.tsx
import React from "react";
import { Group, Text, Badge, Divider, SimpleGrid } from "@mantine/core";
import type { StatsSummary } from "../types";
import InsightCardShell from "./InsightCardShell";

function fmt3(n: number) {
  return Number.isFinite(n) ? n.toFixed(3) : "-";
}

export default function RecentStatsCard({
  title = "최근 요약",
  stats,
}: {
  title?: string;
  stats: StatsSummary;
}) {
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

    {/* 승/무/패 pill을 승률 아래에 작게 */}
    <Group justify="center" gap={6} mt={8} wrap="wrap">
      <Pill label="승" value={stats.wins} tone="green" size="xs" />
      <Pill label="무" value={stats.draws} tone="gray" size="xs" />
      <Pill label="패" value={stats.loses} tone="red" size="xs" />
    </Group>
  </div>

  {/* ✅ 오른쪽: AVG */}
  <Metric label="AVG" value={fmt3(stats.avg)} strong />
</SimpleGrid>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <Group gap={8} wrap="wrap">
        <Pill label="승" value={stats.wins} tone="green" />
        <Pill label="무" value={stats.draws} tone="gray" />
        <Pill label="패" value={stats.loses} tone="red" />
      </Group>
    </InsightCardShell>
  );
}

function Metric({
  label,
  value,
  suffix,
  strong,
}: {
  label: string;
  value: string;
  suffix?: string;
  strong?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 6 }}>
      <Text size="xs" c="dimmed" fw={900} style={{ lineHeight: 1 }}>
        {label}
      </Text>

      <Group gap={6} align="baseline" wrap="nowrap">
        <Text
          fw={strong ? 950 : 900}
          style={{
            fontSize: strong ? 22 : 18,
            letterSpacing: -0.3,
            lineHeight: 1.05,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </Text>
        {suffix ? (
          <Text size="sm" c="dimmed" fw={800}>
            {suffix}
          </Text>
        ) : null}
      </Group>
    </div>
  );
}

function Pill({
  label,
  value,
  tone,
  size="sm",
}: {
  label: string;
  value: number;
  tone: "green" | "gray" | "red";
  size?: "xs"|"sm";
}) {
  const color =
    tone === "green"
      ? "var(--mantine-color-green-7)"
      : tone === "red"
      ? "var(--mantine-color-red-7)"
      : "var(--mantine-color-gray-7)";

      const px = size === "xs" ? 8 : 10;
  const fz = size === "xs" ? 11 : 12;
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: px,
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.9)",
      }}
    >
      <Text size="xs" c="dimmed" fw={900}>
        {label}
      </Text>
      <Text
        size="sm"
        fw={950}
        style={{ color, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}
      >
        {value}
      </Text>
    </div>
  );
}