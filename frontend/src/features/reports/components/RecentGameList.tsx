// src/features/reports/components/RecentGameList.tsx
import React, { useMemo } from "react";
import { Badge, Card, Divider, Grid, GridCol, Group, Stack, Text } from "@mantine/core";
import type { RecentGame } from "../dashboard.types";

type Props = {
  games: RecentGame[];
  onSelectGame?: (gameId: string) => void;
};

function round(n: number, digits: number) {
  const f = 10 ** digits;
  return Math.round((Number.isFinite(n) ? n : 0) * f) / f;
}

function fmtFixed(n: unknown, digits: number) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "-";
  return x.toFixed(digits);
}

function fmtAvg(n: unknown) {
  return fmtFixed(n, 3); // AVG는 항상 3자리
}

function fmtGps(n: unknown) {
  return fmtFixed(n, 1); // GPS는 항상 1자리
}

function toDateKey(iso: string) {
  // "2026-01-15T00:00:00.000Z" -> "2026-01-15"
  // 브라우저 타임존 영향을 줄이기 위해 ISO 문자열의 앞 10자리 사용
  return String(iso).slice(0, 10);
}

function formatDateHeader(dateKey: string) {
  // dateKey: "YY-MM-DD"
  const d = new Date(`${dateKey}T00:00:00.000+09:00`);
  if (Number.isNaN(d.getTime())) return dateKey;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).format(d);
}

function resultMeta(result: RecentGame["result"]): { label: string; color: string } {
  switch (result) {
    case "WIN":
      return { label: "승", color: "blue" };
    case "DRAW":
      return { label: "무", color: "yellow" };
    case "LOSE":
      return { label: "패", color: "red" };
    default:
      return { label: "?", color: "gray" };
  }
}

function gpsColor(gps: number): string {
  if (gps >= 75) return "green";
  if (gps >= 60) return "blue";
  if (gps >= 50) return "gray";
  return "red";
}



function RecentGamesGridHeader() {
  return (
    <Grid gutter={8} align="center">
  <Grid.Col span={2}>
    <Group justify="center" align="center">
      <Text size="xs" c="dimmed" fw={600} ta="center">
        승/무/패
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={2}>
    <Group justify="center" align="center">
      <Text size="xs" c="dimmed" fw={600} ta="center">
        경기종류
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={1.5 as any}>
    <Group justify="center" align="center">
      <Text size="xs" c="dimmed" fw={600} ta="center">
        이닝
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={1.5 as any}>
    <Group justify="center" align="center">
      <Text size="xs" c="dimmed" fw={600} ta="center">
        점수
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={3}>
    <Group justify="center" align="center">
      <Text size="xs" c="dimmed" fw={600} ta="center">
        AVG
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={2}>
    <Group justify="center" align="center">
      <Text size="xs" c="dimmed" fw={600} ta="center">
        GPS
      </Text>
    </Group>
  </Grid.Col>
</Grid>
  );
}



type Grouped = { dateKey: string; items: RecentGame[] };

export default function RecentGameList({ games, onSelectGame }: Props) {
  const grouped: Grouped[] = useMemo(() => {
    // games는 보통 최신순(desc)으로 내려오지만, 어떤 순서든 날짜 그룹핑이 되도록 처리
    const map = new Map<string, RecentGame[]>();

    for (const g of games) {
      const key = toDateKey(g.gameDate);
      const arr = map.get(key) ?? [];
      arr.push(g);
      map.set(key, arr);
    }

    // 날짜 내 게임 정렬: 원래 들어온 순서를 유지(대부분 desc)
    // 날짜 그룹 정렬: dateKey desc(최신 날짜 먼저)
    const keys = Array.from(map.keys()).sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

    return keys.map((k) => ({ dateKey: k, items: map.get(k)! }));
  }, [games]);

  return (
    <Stack gap="sm">
      <Group justify="space-between" align="baseline">
        <Text fw={900}>최근 게임</Text>
        <Text size="xs" c="dimmed">
          {games.length}개
        </Text>
      </Group>
      {/* ✅ Sticky Header (최근 게임 아래 1회) */}
      <div
        style={{
          position: "sticky",
          top: 0,              // AppHeader가 fixed라면 top을 그 높이만큼(예: 56)로 조정
          zIndex: 10,
          background: "var(--mantine-color-body)", // 다크/라이트 자동 대응
          paddingTop: 6,
          paddingBottom: 6,
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        }}
      >
        <RecentGamesGridHeader />
      </div>

      <Stack gap="md">
        {grouped.map(({ dateKey, items }) => (
          <Stack key={dateKey} gap="xs">
            {/* 날짜 헤더 */}
            <Group justify="space-between" align="center">
              <Text fw={800}>{formatDateHeader(dateKey)}</Text>
              <Text size="xs" c="dimmed">
                {items.length}판
              </Text>
            </Group>

            {/* 해당 날짜 게임들 */}
            <Card withBorder radius="md" p="sm">
              <Stack gap="xs">
                {items.map((g, idx) => {
                  const avg = g.inning > 0 ? g.score / g.inning : 0;
                  const r = resultMeta(g.result);
                  const gps = typeof g.gps === "number" ? g.gps : null;

                  const clickable = typeof onSelectGame === "function";
                  const rowProps = clickable
                    ? {
                        role: "button" as const,
                        tabIndex: 0,
                        onClick: () => onSelectGame?.(g._id),
                        onKeyDown: (e: React.KeyboardEvent) => {
                          if (e.key === "Enter" || e.key === " ") onSelectGame?.(g._id);
                        },
                        style: { cursor: "pointer" },
                      }
                    : {};

                  return (
                    <React.Fragment key={g._id}>
                      <div {...rowProps}>
                        <Grid gutter={8} align="center">
  <Grid.Col span={2}>
    <Group justify="center" align="center">
      <Badge variant="filled" color={r.color} radius="xl">
        {r.label}
      </Badge>
    </Group>
  </Grid.Col>

  <Grid.Col span={2}>
    <Group justify="center" align="center">
      <Text size="sm" c="dimmed" ta="center">
        {g.gameType}
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={1.5 as any}>
    <Group justify="center" align="center">
      <Text fw={600} size="sm" ta="center">
        {g.inning}
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={1.5 as any}>
    <Group justify="center" align="center">
      <Text fw={600} size="sm" ta="center">
        {g.score}
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={3}>
    <Group justify="center" align="center">
      <Text fw={600} size="sm" ta="center">
        {fmtAvg(avg)}
      </Text>
    </Group>
  </Grid.Col>

  <Grid.Col span={2}>
    <Group justify="center" align="center">
      {gps !== null ? (
        <Badge variant="light" color={gpsColor(gps)} radius="xl">
          {fmtGps(gps)}
        </Badge>
      ) : (
        <Text size="sm" c="dimmed" ta="center">
          -
        </Text>
      )}
    </Group>
  </Grid.Col>
</Grid>
                      </div>

                      {idx < items.length - 1 ? <Divider /> : null}
                    </React.Fragment>
                  );
                })}
              </Stack>
            </Card>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
