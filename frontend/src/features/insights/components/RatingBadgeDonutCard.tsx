import { useMemo } from "react";
import { Divider, Group, Text } from "@mantine/core";
import type { Game } from "../../games/types";
import { badgeFromRatingAndResult, type RatingBadgeKey } from "../../games/utils/ratingBadge";
import { fmtPct } from "../../../shared/utils/number";
import InsightCardShell from "./InsightCardShell";

const ORDER: RatingBadgeKey[] = ["BUS", "CARRY", "UNLUCKY", "MY_ISSUE", "NORMAL"];

const KEY_META: Record<RatingBadgeKey, { label: string; color: string }> = {
  BUS: { label: "버스", color: "gray" },
  CARRY: { label: "캐리", color: "green" },
  UNLUCKY: { label: "억울", color: "yellow" },
  MY_ISSUE: { label: "내이슈", color: "red" },
  NORMAL: { label: "보통", color: "blue" },
};

function toColorVar(color: string) {
  if (color.startsWith("#")) return color;
  return `var(--mantine-color-${color}-6)`;
}

export default function RatingBadgeDonutCard({
  games,
  title = "버스/캐리 비율",
}: {
  games: Game[];
  title?: string;
}) {
  const { total, segments } = useMemo(() => {
    const rated = games.filter((g) => typeof g.rating === "number" && Number.isFinite(g.rating));
    const map = new Map<RatingBadgeKey, { label: string; color: string; count: number }>();
    ORDER.forEach((k) => map.set(k, { ...KEY_META[k], count: 0 }));

    for (const g of rated) {
      const badge = badgeFromRatingAndResult(g.rating, g.result);
      const entry = map.get(badge.key) ?? { ...KEY_META[badge.key], count: 0 };
      entry.count += 1;
      entry.label = badge.label;
      entry.color = badge.color;
      map.set(badge.key, entry);
    }

    const totalCount = rated.length;
    const segments = ORDER.map((key) => {
      const item = map.get(key) ?? { ...KEY_META[key], count: 0 };
      const ratio = totalCount > 0 ? item.count / totalCount : 0;
      return {
        key,
        label: item.label,
        color: item.color,
        count: item.count,
        ratio,
      };
    });

    return { total: totalCount, segments };
  }, [games]);

  const size = 120;
  const radius = 44;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;
  const donutSegments = segments.map((seg) => {
    const length = seg.ratio * circumference;
    const dasharray = `${length} ${circumference - length}`;
    const dashoffset = -offset;
    offset += length;
    return { ...seg, dasharray, dashoffset };
  });

  return (
    <InsightCardShell>
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3 }}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            평점 있는 경기 기준
          </Text>
        </div>
        <Text size="xs" c="dimmed" fw={900}>
          {total}판
        </Text>
      </Group>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth={stroke}
              />
              {donutSegments.map((seg) => (
                <circle
                  key={seg.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={toColorVar(seg.color)}
                  strokeWidth={stroke}
                  strokeDasharray={seg.dasharray}
                  strokeDashoffset={seg.dashoffset}
                  strokeLinecap="butt"
                />
              ))}
            </g>
          </svg>

          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              gap: 2,
            }}
          >
            <Text size="xs" c="dimmed" fw={900}>
              평점 경기
            </Text>
            <Text fw={950} style={{ fontSize: 18, fontVariantNumeric: "tabular-nums" }}>
              {total}
            </Text>
          </div>
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {segments.map((seg) => (
            <Group key={seg.key} justify="space-between" gap={8} wrap="nowrap">
              <Group gap={8} wrap="nowrap">
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 999,
                    background: toColorVar(seg.color),
                    display: "inline-block",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.08)",
                  }}
                />
                <Text size="sm" fw={900}>
                  {seg.label}
                </Text>
              </Group>
              <Text size="sm" fw={900} style={{ fontVariantNumeric: "tabular-nums" }}>
                {seg.count} ({fmtPct(seg.ratio, 0)}%)
              </Text>
            </Group>
          ))}
        </div>
      </div>
    </InsightCardShell>
  );
}
