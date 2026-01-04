// src/features/insights/components/InsightBadges.tsx
import React from "react";
import { Badge, Group } from "@mantine/core";
import type { InsightAnalysis, TeamIndicators } from "../types";
import { statusMeta } from "../utils";

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function teamBadge(team: TeamIndicators) {
  if (!team || num(team.sampleN) < 5) return { color: "gray", label: "🧩 팀전 보류" } as const;

  const bad = num(team.weighted?.luckBadScore);
  const bus = num(team.weighted?.busScore);
  const carry = num(team.weighted?.carryScore);
  const self = num(team.weighted?.selfIssueScore);

  // 제일 큰 성격을 뽑아 배지로
  const arr = [
    { k: "bad", v: bad, label: "🎲 팀운 나쁨" },
    { k: "bus", v: bus, label: "🚌 버스" },
    { k: "carry", v: carry, label: "🔥 캐리" },
    { k: "self", v: self, label: "🧊 내 이슈" },
  ].sort((a, b) => b.v - a.v);

  const top = arr[0];
  if (top.v < 18) return { color: "green", label: "✅ 팀전 균형" } as const;

  const color =
    top.k === "bad" ? "red" :
    top.k === "bus" ? "yellow" :
    top.k === "carry" ? "teal" :
    "orange";

  return { color, label: top.label } as const;
}

export function InsightBadgeRow({
  all,
  team,
  compact = true,
}: {
  all: InsightAnalysis;
  team: TeamIndicators;
  compact?: boolean;
}) {
  const f = statusMeta(all.status);
  const t = teamBadge(team);

  return (
    <Group gap={compact ? 6 : "xs"} wrap="wrap">
      <Badge variant="light" radius="xl" color={f.color}>
        {f.emoji} 폼 {f.label}
      </Badge>
      <Badge variant="light" radius="xl" color={t.color}>
        {t.label}
      </Badge>
    </Group>
  );
}