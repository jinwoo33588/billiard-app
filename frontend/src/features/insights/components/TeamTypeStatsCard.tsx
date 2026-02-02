import { Divider, Group, SimpleGrid, Text } from "@mantine/core";
import InsightCardShell from "./InsightCardShell";
import type { Game } from "../../games/types";
import { fmt3, fmtPct, fmtInt } from "../../../shared/utils/number";

type Summary = {
  gamesCount: number;
  wins: number;
  draws: number;
  loses: number;
  winRate: number;
  avg: number;
  expectedWinRate: number;
};

function safeDiv(a: number, b: number) {
  return b > 0 ? a / b : 0;
}

function summarize(games: Game[], expectedWinRate: number): Summary {
  let wins = 0;
  let draws = 0;
  let loses = 0;
  let scoreSum = 0;
  let inningSum = 0;

  for (const g of games) {
    if (g.result === "WIN") wins += 1;
    if (g.result === "DRAW") draws += 1;
    if (g.result === "LOSE") loses += 1;
    scoreSum += Number(g.score || 0);
    inningSum += Number(g.inning || 0);
  }

  const winRate = safeDiv(wins, wins + loses);
  const avg = safeDiv(scoreSum, inningSum);

  return {
    gamesCount: games.length,
    wins,
    draws,
    loses,
    winRate,
    avg,
    expectedWinRate,
  };
}

function StatRow({ title, data }: { title: string; data: Summary }) {
  const winPct = fmtPct(data.winRate, 1, "-");
  const expectedPct = fmtPct(data.expectedWinRate, 1, "-");
  const avg = fmt3(data.avg, "-");

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.95)",
        padding: 12,
        display: "grid",
        gap: 8,
      }}
    >
      <Group justify="space-between" align="center">
        <Text fw={900}>{title}</Text>
        <Text size="xs" c="dimmed" fw={800}>
          {fmtInt(data.gamesCount)}판
        </Text>
      </Group>

      <SimpleGrid cols={2} spacing="xs" verticalSpacing="xs">
        <div>
          <Text size="xs" c="dimmed" fw={900}>
            승률
          </Text>
          <Text fw={950} style={{ fontVariantNumeric: "tabular-nums" }}>
            {winPct}%
          </Text>
          <Text size="xs" c="dimmed" fw={800} mt={2}>
            기대승률 {expectedPct}%
          </Text>
        </div>
        <div style={{ textAlign: "right" }}>
          <Text size="xs" c="dimmed" fw={900}>
            AVG
          </Text>
          <Text fw={950} style={{ fontVariantNumeric: "tabular-nums" }}>
            {avg}
          </Text>
          <Text size="xs" c="dimmed" fw={800} mt={2}>
            {data.wins}승 · {data.draws}무 · {data.loses}패
          </Text>
        </div>
      </SimpleGrid>
    </div>
  );
}

export default function TeamTypeStatsCard({ games }: { games: Game[] }) {
  const twoTeamGames = games.filter((g) => ["1v1", "2v2", "3v3"].includes(g.gameType));
  const threeTeamGames = games.filter((g) => ["2v2v2", "3v3v3"].includes(g.gameType));

  const twoTeam = summarize(twoTeamGames, 0.5);
  const threeTeam = summarize(threeTeamGames, 2 / 3);

  return (
    <InsightCardShell>
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3 }}>
            팀 구성별 성과
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            2팀(1v1/2v2/3v3) vs 3팀(2v2v2/3v3v3)
          </Text>
        </div>
      </Group>

      <Divider my="sm" style={{ borderColor: "rgba(0,0,0,0.08)" }} />

      <SimpleGrid cols={2} spacing="sm" verticalSpacing="sm">
        <StatRow title="2팀 경기" data={twoTeam} />
        <StatRow title="3팀 경기" data={threeTeam} />
      </SimpleGrid>
    </InsightCardShell>
  );
}
