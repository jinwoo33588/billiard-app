import { useMemo } from "react";
import { Badge, Divider, Group, Text } from "@mantine/core";
import type { Game } from "../../games/types";
import { badgeFromRatingAndResult } from "../../games/utils/ratingBadge";
import { calcAvg } from "../../../shared/utils/gameMath";
import { fmt1, fmt3 } from "../../../shared/utils/number";
import { getGameResultLabel, getGameResultTone } from "../../../shared/utils/gameLabels";
import InsightCardShell from "./InsightCardShell";

function pickBestWorst(games: Game[]) {
  const rated = games.filter((g) => typeof g.rating === "number" && Number.isFinite(g.rating));
  if (!rated.length) return { best: null as Game | null, worst: null as Game | null, total: 0 };

  let best = rated[0];
  let worst = rated[0];

  for (const g of rated) {
    if ((g.rating ?? -Infinity) > (best.rating ?? -Infinity)) best = g;
    if ((g.rating ?? Infinity) < (worst.rating ?? Infinity)) worst = g;
  }

  return { best, worst, total: rated.length };
}

function GameBox({
  label,
  game,
  accent,
}: {
  label: string;
  game: Game;
  accent: string;
}) {
  const rating = game.rating ?? NaN;
  const avg = game.avg ?? calcAvg(game.score, game.inning);
  const result = getGameResultTone(game.result);
  const resultLabel = getGameResultLabel(game.result);
  const badge = badgeFromRatingAndResult(rating, game.result);

  return (
    <div
      style={{
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.9)",
        display: "grid",
        gap: 6,
      }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text size="xs" fw={950} style={{ color: accent, letterSpacing: 0.6 }}>
          {label}
        </Text>
        <Text size="xs" c="dimmed" fw={900}>
          {String(game.gameDate).slice(0, 10)}
        </Text>
      </Group>

      <Text fw={950} style={{ fontSize: 22, fontVariantNumeric: "tabular-nums" }}>
        {fmt1(rating)}
      </Text>

      <Text size="xs" c="dimmed" fw={900} style={{ fontVariantNumeric: "tabular-nums" }}>
        {game.inning}이닝 · {game.score}점 · AVG {fmt3(avg)}
      </Text>

      <Group gap={6} wrap="nowrap">
        <Badge
          size="xs"
          radius="xl"
          variant="light"
          color={result.mantineColor}
          style={{ fontWeight: 900, border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {resultLabel}
        </Badge>
        <Badge
          size="xs"
          radius="xl"
          variant="light"
          color={badge.color}
          style={{ fontWeight: 900, border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {badge.label}
        </Badge>
      </Group>
    </div>
  );
}

export default function BestWorstGameCard({
  games,
  title = "베스트/워스트",
}: {
  games: Game[];
  title?: string;
}) {
  const { best, worst, total } = useMemo(() => pickBestWorst(games), [games]);

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

      {!best || !worst ? (
        <Text size="sm" c="dimmed">
          평점 데이터가 없습니다.
        </Text>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          <GameBox label="BEST" game={best} accent="var(--mantine-color-blue-7)" />
          <GameBox label="WORST" game={worst} accent="var(--mantine-color-red-7)" />
        </div>
      )}
    </InsightCardShell>
  );
}
