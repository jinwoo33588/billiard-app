import React, { useMemo } from "react";
import { Group, Text } from "@mantine/core";
import type { Game } from "../../games/types";
import InsightCardShell from "./InsightCardShell";
import Pill from "../../../shared/components/Pill";

type Result = "WIN" | "LOSE";

function normalizeResult(r: Game["result"]): Result | null {
  if (r === "WIN" || r === "LOSE") return r;
  return null;
}

function resultLabel(r: Result) {
  if (r === "WIN") return "연승";
  if (r === "LOSE") return "연패";
  return "연속";
}

function resultTone(r: Result) {
  if (r === "WIN") return { color: "var(--mantine-color-teal-7)", bg: "rgba(20, 184, 166, 0.08)" };
  return { color: "var(--mantine-color-red-7)", bg: "rgba(239, 68, 68, 0.08)" };
}

function computeStreaks(games: Game[]) {
  const list = games;
  const currentResult = list.length ? normalizeResult(list[0].result) : null;
  let currentLen = 0;
  if (currentResult) {
    for (const g of list) {
      if (normalizeResult(g.result) === currentResult) currentLen += 1;
      else break;
    }
  }

  let bestWin = 0;
  let bestLose = 0;
  let runResult: Result | null = null;
  let runLen = 0;

  const flush = () => {
    if (!runResult) return;
    if (runResult === "WIN") bestWin = Math.max(bestWin, runLen);
    if (runResult === "LOSE") bestLose = Math.max(bestLose, runLen);
  };

  for (const g of list) {
    const r = normalizeResult(g.result);
    if (!r) {
      flush();
      runResult = null;
      runLen = 0;
      continue;
    }
    if (runResult === r) {
      runLen += 1;
    } else {
      flush();
      runResult = r;
      runLen = 1;
    }
  }
  flush();

  return { currentResult, currentLen, bestWin, bestLose };
}

export default function StreakCard({ games, title = "연속 기록", limit = 30 }: { games: Game[]; title?: string; limit?: number }) {
  const { currentResult, currentLen, bestWin, bestLose } = useMemo(
    () => computeStreaks(games.slice(0, limit)),
    [games, limit]
  );

  const currentTone = currentResult ? resultTone(currentResult) : null;

  return (
    <InsightCardShell>
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3 }}>
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            최근 {Math.min(limit, games.length)}판
          </Text>
        </div>
        {currentResult ? (
          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              background: currentTone?.bg,
              color: currentTone?.color,
              fontWeight: 900,
              fontSize: 12,
              letterSpacing: -0.2,
            }}
          >
            {currentLen}{resultLabel(currentResult)}
          </div>
        ) : (
          <Text size="xs" c="dimmed">
            기록 없음
          </Text>
        )}
      </Group>

      <Group mt={12} gap={10} wrap="wrap">
        <Pill
          label="최고 연승"
          value={bestWin}
          color="var(--mantine-color-teal-7)"
          background="rgba(255,255,255,0.92)"
        />
        <Pill
          label="최고 연패"
          value={bestLose}
          color="var(--mantine-color-red-7)"
          background="rgba(255,255,255,0.92)"
        />
      </Group>
    </InsightCardShell>
  );
}
