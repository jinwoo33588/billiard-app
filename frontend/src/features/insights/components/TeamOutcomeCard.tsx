// frontend/src/features/insights/components/TeamOutcomeCard.tsx
import React, { useMemo } from "react";
import { Badge, Card, Group, Stack, Text, Divider } from "@mantine/core";
import { summarizeTeamOutcomes, type OutcomeCategory } from "../utils/teamOutcome";
import type { TeamGameRow } from "../types";

function labelOf(k: OutcomeCategory) {
  if (k === "CARRY_WIN") return "캐리승";
  if (k === "NORMAL_WIN") return "보통승";
  if (k === "BUS_WIN") return "버스승";
  if (k === "HARD_LOSE") return "억울패";
  if (k === "NORMAL_LOSE") return "보통패";
  return "내탓패"; // SELF_LOSE
}

function colorOf(k: OutcomeCategory) {
  if (k === "CARRY_WIN") return "var(--mantine-color-teal-6)";
  if (k === "NORMAL_WIN") return "var(--mantine-color-blue-5)";
  if (k === "BUS_WIN") return "var(--mantine-color-indigo-6)";
  if (k === "HARD_LOSE") return "var(--mantine-color-yellow-6)";
  if (k === "NORMAL_LOSE") return "var(--mantine-color-gray-5)";
  return "var(--mantine-color-red-6)"; // SELF_LOSE
}

type Slice = { key: OutcomeCategory; value: number; label: string; color: string };

function Donut({
  size = 176,
  thickness = 18,
  slices,
  centerTop,
  centerBottom,
}: {
  size?: number;
  thickness?: number;
  slices: Slice[];
  centerTop?: string;
  centerBottom?: string;
}) {
  const r = (size - thickness) / 2;
  const c = size / 2;
  const circ = 2 * Math.PI * r;

  const safe = slices.filter((s) => s.value > 0);

  let acc = 0; // 0~1

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* background ring */}
        <circle
          cx={c}
          cy={c}
          r={r}
          fill="none"
          stroke="var(--mantine-color-gray-2)"
          strokeWidth={thickness}
        />

        {/* slices */}
        {safe.map((s) => {
          const frac = s.value / 100;
          const dash = circ * frac;
          const gap = circ - dash;

          const rotate = -90 + acc * 360;
          acc += frac;

          return (
            <circle
              key={s.key}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="butt"
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotate} ${c} ${c})`}
            >
              <title>
                {s.label} {s.value.toFixed(1)}%
              </title>
            </circle>
          );
        })}
      </svg>

      {/* center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          pointerEvents: "none",
          textAlign: "center",
          padding: 8,
        }}
      >
        {centerTop && (
          <Text fw={900} style={{ fontSize: 20, lineHeight: 1.05 }}>
            {centerTop}
          </Text>
        )}
        {centerBottom && (
          <Text size="xs" c="dimmed" style={{ marginTop: 6, lineHeight: 1.2 }}>
            {centerBottom}
          </Text>
        )}
      </div>
    </div>
  );
}

function MetricRow({
  label,
  color,
  count,
  rate,
}: {
  label: string;
  color: string;
  count: number;
  rate: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        padding: "10px 10px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: color,
            boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
            flex: "0 0 auto",
          }}
        />
        <Text size="sm" fw={700} lineClamp={1} style={{ minWidth: 0 }}>
          {label}
        </Text>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "0 0 auto" }}>
        <Text size="xs" c="dimmed">
          {count}판
        </Text>
        <Badge radius="xl" variant="light" color="gray" style={{ minWidth: 64, justifyContent: "center" }}>
          {rate.toFixed(1)}%
        </Badge>
      </div>
    </div>
  );
}

export default function TeamOutcomeCard({
  games,
  goodCut = 60,
  badCut = 40,
  includeNeutral = true,
}: {
  games: TeamGameRow[] | null | undefined;
  goodCut?: number;
  badCut?: number;
  includeNeutral?: boolean;
}) {
  const summary = useMemo(
    () => summarizeTeamOutcomes(games, { goodCut, badCut, includeNeutral }),
    [games, goodCut, badCut, includeNeutral]
  );

  const order: OutcomeCategory[] = useMemo(
    () => ["CARRY_WIN", "NORMAL_WIN", "BUS_WIN", "HARD_LOSE", "NORMAL_LOSE", "SELF_LOSE"],
    []
  );

  const slices: Slice[] = useMemo(
    () =>
      order.map((k) => ({
        key: k,
        value: summary.rates[k], // 0~100
        label: labelOf(k),
        color: colorOf(k),
      })),
    [order, summary]
  );

  const top = useMemo(() => {
    const xs = order
      .map((k) => ({ k, v: summary.rates[k], c: summary.counts[k] }))
      .sort((a, b) => b.v - a.v);
      return xs[0] ?? { k: "NORMAL_WIN" as OutcomeCategory, v: 0, c: 0 };
  }, [order, summary]);

  if (!games || games.length === 0) {
    return (
      <Card withBorder radius="md" p="sm">
        <Text fw={900}>팀전 결과</Text>
        <Text size="sm" c="dimmed" mt={6}>
          표본이 없습니다.
        </Text>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="sm">
      <Group justify="space-between" mb={6} wrap="nowrap">
        <Text fw={900}>팀전 결과</Text>
        <Badge radius="xl" variant="light">
          N {summary.sampleN}
        </Badge>
      </Group>

      <Text size="xs" c="dimmed">
        gps로 “잘침/못침”을 판단( good≥{goodCut} / bad≤{badCut} )하고 승/패와 조합해 비율을 냅니다.
      </Text>

      <Divider my="sm" />

      {/* ✅ 모바일: 도넛은 가운데 크게 */}
      <div style={{ display: "flex", justifyContent: "center", padding: "6px 0 2px" }}>
        <Donut
          size={182}
          thickness={18}
          slices={slices}
          centerTop={`${top.v.toFixed(1)}%`}
          centerBottom={`${labelOf(top.k)} · ${top.c}판`}
        />
      </div>

      <Stack gap={8} mt="sm">
        {order.map((k) => (
          <MetricRow
            key={k}
            label={labelOf(k)}
            color={colorOf(k)}
            count={summary.counts[k]}
            rate={summary.rates[k]}
          />
        ))}
      </Stack>

      
    </Card>
  );
}