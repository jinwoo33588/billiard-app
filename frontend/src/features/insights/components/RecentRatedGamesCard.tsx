// frontend/src/features/insights/components/RecentRatedGamesCard.tsx
import React from "react";
import { Group, Text, Divider, Badge } from "@mantine/core";
import InsightCardShell from "./InsightCardShell";
import type { Game } from "../../games/types";
import { badgeFromRatingAndResult } from "../../games/utils/ratingBadge";

function fmt1(n: number) {
  return Number.isFinite(n) ? n.toFixed(1) : "-";
}
function fmt3(n: number) {
  return Number.isFinite(n) ? n.toFixed(3) : "-";
}

function resultBadge(r: Game["result"]) {
  if (r === "WIN") return { label: "승", color: "green" as const };
  if (r === "LOSE") return { label: "패", color: "red" as const };
  if (r === "DRAW") return { label: "무", color: "gray" as const };
  return { label: "기타", color: "gray" as const };
}

export default function RecentRatedGamesCard({
  title = "최근 경기 평점",
  games,
}: {
  title?: string;
  games: (Game & { rating?: number; avg?: number })[];
}) {
  return (
    <InsightCardShell>
      <Group justify="space-between" align="center">
        <Text fw={950} style={{ letterSpacing: -0.3 }}>
          {title}
        </Text>
        <Text size="xs" c="dimmed" fw={900}>
          {games.length}판
        </Text>
      </Group>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <div style={{ display: "grid", gap: 10 }}>
        {games.map((g) => {
          const rating = (g as any).rating as number | undefined;
          const avg = (g as any).avg ?? g.score / Math.max(1, g.inning);

          const rb = resultBadge(g.result);
          const ib = badgeFromRatingAndResult(rating, g.result);

          return (
            <div
              key={g.id}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: 12,
                padding: "10px 10px",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                background: "rgba(255,255,255,0.9)",
              }}
            >
              {/* ✅ LEFT */}
              <div style={{ minWidth: 0 }}>
  {/* 상단: 날짜 */}
  <Text size="xs" c="dimmed" fw={900} style={{ lineHeight: 1.1 }}>
    {String(g.gameDate).slice(0, 10)}
  </Text>

  {/* 메인: 한 줄로 꽉 */}
  <Group
    gap={8}
    wrap="nowrap"
    mt={6}
    align="center"
    style={{
      minWidth: 0,
      flexWrap: "nowrap",
    }}
  >
    {/* 이닝 */}
    <Text
      size="sm"
      fw={950}
      style={{
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {g.inning}이닝
    </Text>

    {/* 점수 */}
    <Text
      size="sm"
      fw={950}
      style={{
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {g.score}점
    </Text>

    {/* AVG */}
    <Text
      size="sm"
      fw={900}
      c="dimmed"
      style={{
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      AVG {fmt3(avg)}
    </Text>

    {/* ✅ 남는 공간 처리용 스페이서: 배지를 오른쪽으로 밀고 싶으면 사용 */}
    <div style={{ flex: 1 }} />

    {/* 배지 2개: 최대한 한 줄 유지 */}
    <Group gap={6} wrap="nowrap" style={{ flexShrink: 0 }}>
      <Badge
        size="xs"
        radius="xl"
        variant="light"
        color={rb.color}
        style={{ fontWeight: 900, border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {rb.label}
      </Badge>

      <Badge
        size="xs"
        radius="xl"
        variant="light"
        color={ib.color}
        style={{ fontWeight: 900, border: "1px solid rgba(0,0,0,0.08)" }}
      >
        {ib.label}
      </Badge>
    </Group>
  </Group>
</div>

              {/* ✅ RIGHT: rating */}
              <div style={{ textAlign: "right", minWidth: 70 }}>
                <Text size="xs" c="dimmed" fw={900}>
                  RATING
                </Text>
                <Text
                  fw={950}
                  style={{
                    fontSize: 18,
                    fontVariantNumeric: "tabular-nums",
                    lineHeight: 1.05,
                    marginTop: 2,
                  }}
                >
                  {fmt1(rating ?? NaN)}
                </Text>
              </div>
            </div>
          );
        })}
      </div>
    </InsightCardShell>
  );
}