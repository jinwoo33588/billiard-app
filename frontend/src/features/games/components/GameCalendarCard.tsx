import { useEffect, useMemo, useState } from "react";
import { ActionIcon, Badge, Card, Group, Text } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { Game } from "../types";
import { calcAvg } from "../../../shared/utils/gameMath";
import { fmt1, fmt3 } from "../../../shared/utils/number";
import { getGameResultLabel, getGameResultTone } from "../../../shared/utils/gameLabels";
import { badgeFromRatingAndResult } from "../utils/ratingBadge";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

type ResultTone = {
  fill: string;
  border: string;
};

type CellVariant = "split" | "stack" | "dots" | "bar" | "side" | "heatSplit" | "diagonal" | "dotMatrix";

function toDate(value?: string | Date | null) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function monthLabel(d: Date) {
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월`;
}

function resultTone(result: Game["result"]): ResultTone {
  if (result === "WIN") {
    return {
      fill: "linear-gradient(135deg, var(--mantine-color-blue-4), var(--mantine-color-blue-7))",
      border: "var(--mantine-color-blue-6)",
    };
  }
  if (result === "LOSE") {
    return {
      fill: "linear-gradient(135deg, var(--mantine-color-red-4), var(--mantine-color-red-7))",
      border: "var(--mantine-color-red-6)",
    };
  }
  return {
    fill: "linear-gradient(135deg, var(--mantine-color-gray-2), var(--mantine-color-gray-5))",
    border: "rgba(0,0,0,0.25)",
  };
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function toneLevel(ratio: number, min = 4, max = 8) {
  const r = clamp(ratio, 0, 1);
  return Math.round(min + (max - min) * r);
}

function resultToneByRatio(result: Game["result"], ratio: number): ResultTone {
  if (result === "WIN") {
    const level = toneLevel(ratio);
    const start = clamp(level - 2, 2, 9);
    const end = clamp(level + 1, 3, 9);
    return {
      fill: `linear-gradient(135deg, var(--mantine-color-blue-${start}), var(--mantine-color-blue-${end}))`,
      border: `var(--mantine-color-blue-${clamp(level, 3, 9)})`,
    };
  }
  if (result === "LOSE") {
    const level = toneLevel(ratio);
    const start = clamp(level - 2, 2, 9);
    const end = clamp(level + 1, 3, 9);
    return {
      fill: `linear-gradient(135deg, var(--mantine-color-red-${start}), var(--mantine-color-red-${end}))`,
      border: `var(--mantine-color-red-${clamp(level, 3, 9)})`,
    };
  }
  return resultTone(result);
}

function sortByTime(games: Game[]) {
  return [...games].sort((a, b) => {
    const ta = new Date(a.gameDate).getTime();
    const tb = new Date(b.gameDate).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return ta - tb;
  });
}

export default function GameCalendarCard({
  games,
  title = "게임 캘린더",
  initialDate,
  compact = false,
  showList = true,
  lockMonth = false,
  autoSelect = true,
  cellVariant = "heatSplit",
  selectedDate: selectedDateProp,
  onSelectDate,
}: {
  games: Game[];
  title?: string;
  initialDate?: string | Date | null;
  compact?: boolean;
  showList?: boolean;
  lockMonth?: boolean;
  autoSelect?: boolean;
  cellVariant?: CellVariant;
  selectedDate?: string | null;
  onSelectDate?: (date: string | null) => void;
}) {
  const initial = useMemo(() => {
    const d = toDate(initialDate);
    if (d) return new Date(d.getFullYear(), d.getMonth(), 1);
    return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  }, [initialDate]);

  const [viewDate, setViewDate] = useState<Date>(initial);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const controlled = typeof selectedDateProp !== "undefined";
  const selectedDateValue = controlled ? selectedDateProp : selectedDate;
  const setSelectedDateValue = (next: string | null) => {
    if (!controlled) setSelectedDate(next);
    if (onSelectDate) onSelectDate(next);
  };

  useEffect(() => {
    setViewDate(initial);
  }, [initial]);

  const { dayMap } = useMemo(() => {
    const map = new Map<string, Game[]>();
    for (const g of games) {
      const d = toDate(g.gameDate);
      if (!d) continue;
      const key = ymd(d);
      const list = map.get(key) ?? [];
      list.push(g);
      map.set(key, list);
    }
    return { dayMap: map };
  }, [games]);

  useEffect(() => {
    if (!autoSelect) return;
    if (selectedDateValue) return;
    const keys = Array.from(dayMap.keys()).sort();
    const latestKey = keys.length ? keys[keys.length - 1] : null;
    if (latestKey) setSelectedDateValue(latestKey);
  }, [autoSelect, dayMap, selectedDateValue]);

  const year = viewDate.getFullYear();
  const month0 = viewDate.getMonth();
  const firstDay = new Date(year, month0, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();

  const cells = Array.from({ length: 42 }, (_, idx) => {
    const dayNum = idx - startWeekday + 1;
    if (dayNum < 1 || dayNum > daysInMonth) return null;
    return new Date(year, month0, dayNum);
  });

  const selectedGames = selectedDateValue ? dayMap.get(selectedDateValue) ?? [] : [];

  const cellHeight = compact ? 32 : 44;
  const cellGap = compact ? 4 : 6;
  const weekdayGap = compact ? 4 : 6;
  const datePillFont = compact ? 11 : 13;
  const datePillPad = compact ? "1px 5px" : "2px 6px";
  const datePillShadow = "0 0 0 1px rgba(0,0,0,0.05)";

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{ borderColor: "rgba(0,0,0,0.08)", background: "var(--mantine-color-body)" }}
    >
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text fw={950} style={{ letterSpacing: -0.3 }}>
          {title}
        </Text>
        <Group gap={6} wrap="nowrap">
          {!lockMonth ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setViewDate(new Date(year, month0 - 1, 1))}
              aria-label="prev month"
            >
              <IconChevronLeft size={16} />
            </ActionIcon>
          ) : null}
          <Text size="sm" fw={900} style={{ minWidth: 120, textAlign: "center" }}>
            {monthLabel(viewDate)}
          </Text>
          {!lockMonth ? (
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => setViewDate(new Date(year, month0 + 1, 1))}
              aria-label="next month"
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          ) : null}
        </Group>
      </Group>

      <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: weekdayGap }}>
        {WEEKDAYS.map((w) => (
          <Text key={w} size="xs" c="dimmed" fw={900} style={{ textAlign: "center" }}>
            {w}
          </Text>
        ))}
      </div>

      <div style={{ marginTop: 6, display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: cellGap }}>
        {cells.map((d, idx) => {
          if (!d) return <div key={`empty-${idx}`} />;
          const key = ymd(d);
          const dayGames = dayMap.get(key) ?? [];
          const winCount = dayGames.filter((g) => g.result === "WIN").length;
          const loseCount = dayGames.filter((g) => g.result === "LOSE").length;
          const totalCount = winCount + loseCount;
          const winRatio = totalCount ? winCount / totalCount : 0;
          const loseRatio = totalCount ? loseCount / totalCount : 0;

          const winTone = resultToneByRatio("WIN", winRatio);
          const loseTone = resultToneByRatio("LOSE", loseRatio);

          const segments = sortByTime(dayGames)
            .filter((g) => g.result === "WIN" || g.result === "LOSE")
            .map((g) => (g.result === "WIN" ? winTone : loseTone));
          const isSelected = selectedDateValue === key;

          const barSize = compact ? 6 : 8;
          const splitPoint = Math.round(winRatio * 100);
          const winSolid = `var(--mantine-color-blue-${clamp(toneLevel(winRatio), 3, 9)})`;
          const loseSolid = `var(--mantine-color-red-${clamp(toneLevel(loseRatio), 3, 9)})`;
          const heatDelta = Math.abs(winRatio - loseRatio);
          const heatLevel = clamp(Math.round(1 + heatDelta * 2), 1, 3);
          const heatBg =
            totalCount === 0
              ? "rgba(255,255,255,0.7)"
              : winRatio > loseRatio
                ? `var(--mantine-color-blue-${heatLevel})`
                : loseRatio > winRatio
                  ? `var(--mantine-color-red-${heatLevel})`
                  : "var(--mantine-color-gray-1)";
          const diagonalFill =
            totalCount === 0
              ? "rgba(255,255,255,0.7)"
              : `linear-gradient(135deg, ${winSolid} 0%, ${winSolid} ${splitPoint}%, ${loseSolid} ${splitPoint}%, ${loseSolid} 100%)`;
          const cellBackground =
            cellVariant === "diagonal"
              ? diagonalFill
              : cellVariant === "heatSplit"
                ? heatBg
                : "rgba(255,255,255,0.7)";

          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelectedDateValue(key)}
              style={{
                height: cellHeight,
                borderRadius: 10,
                border: isSelected ? "2px solid var(--mantine-color-blue-6)" : "1px solid rgba(0,0,0,0.08)",
                background: cellBackground,
                color: "inherit",
                fontWeight: 900,
                cursor: "pointer",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {segments.length && cellVariant !== "diagonal" ? (
                cellVariant === "split" ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                    }}
                  >
                    {segments.map((seg, i) => (
                      <span
                        key={`${key}-${i}`}
                        style={{
                          flex: 1,
                          background: seg.fill,
                          borderRight: i < segments.length - 1 ? `1px solid ${seg.border}` : "none",
                        }}
                      />
                    ))}
                  </div>
                ) : cellVariant === "stack" ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {segments.map((seg, i) => (
                      <span
                        key={`${key}-${i}`}
                        style={{
                          flex: 1,
                          background: seg.fill,
                          borderBottom: i < segments.length - 1 ? `1px solid ${seg.border}` : "none",
                        }}
                      />
                    ))}
                  </div>
                ) : cellVariant === "bar" || cellVariant === "heatSplit" ? (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: 0,
                      height: barSize,
                      display: "flex",
                    }}
                  >
                    {segments.map((seg, i) => (
                      <span
                        key={`${key}-${i}`}
                        style={{
                          flex: 1,
                          background: seg.fill,
                          borderRight: i < segments.length - 1 ? `1px solid ${seg.border}` : "none",
                        }}
                      />
                    ))}
                  </div>
                ) : cellVariant === "side" ? (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      bottom: 0,
                      left: 0,
                      width: barSize,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {segments.map((seg, i) => (
                      <span
                        key={`${key}-${i}`}
                        style={{
                          flex: 1,
                          background: seg.fill,
                          borderBottom: i < segments.length - 1 ? `1px solid ${seg.border}` : "none",
                        }}
                      />
                    ))}
                  </div>
                ) : cellVariant === "dotMatrix" ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${compact ? 4 : 5}, ${compact ? 6 : 7}px)`,
                        gap: compact ? 2 : 3,
                        paddingTop: compact ? 4 : 6,
                      }}
                    >
                      {segments.map((seg, i) => (
                        <span
                          key={`${key}-${i}`}
                          style={{
                            width: compact ? 6 : 7,
                            height: compact ? 6 : 7,
                            borderRadius: 999,
                            background: seg.fill,
                            boxShadow: `0 0 0 1px ${seg.border}`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      paddingBottom: compact ? 4 : 6,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 3,
                        maxWidth: "90%",
                        justifyContent: "center",
                      }}
                    >
                      {segments.map((seg, i) => (
                        <span
                          key={`${key}-${i}`}
                          style={{
                            width: compact ? 6 : 7,
                            height: compact ? 6 : 7,
                            borderRadius: 999,
                            background: seg.fill,
                            boxShadow: `0 0 0 1px ${seg.border}`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )
              ) : null}
              <span
                style={{
                  position: "relative",
                  zIndex: 1,
                  fontSize: datePillFont,
                  padding: datePillPad,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.9)",
                  boxShadow: datePillShadow,
                }}
              >
                {d.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {showList ? (
        <div style={{ marginTop: 12 }}>
        <Group justify="space-between" align="center" wrap="nowrap">
          <Text fw={900} size="sm">
            {selectedDateValue ?? "날짜 선택"}
          </Text>
          <Text size="xs" c="dimmed" fw={900}>
            {selectedGames.length}판
          </Text>
        </Group>

        {selectedGames.length ? (
          <div style={{ marginTop: 8, display: "grid", gap: 8 }}>
            {selectedGames.map((g) => {
              const rating = g.rating;
              const avg = g.avg ?? calcAvg(g.score, g.inning);
              const result = getGameResultTone(g.result);
              const resultLabel = getGameResultLabel(g.result);
              const badge = badgeFromRatingAndResult(rating, g.result);

              return (
                <div
                  key={g.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid rgba(0,0,0,0.08)",
                    background: "rgba(255,255,255,0.9)",
                  }}
                >
                  <div style={{ minWidth: 0 }}>
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
                    <Text size="sm" fw={900} style={{ marginTop: 4, fontVariantNumeric: "tabular-nums" }}>
                      {g.inning}이닝 · {g.score}점 · AVG {fmt3(avg)}
                    </Text>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 60 }}>
                    <Text size="xs" c="dimmed" fw={900}>
                      RATING
                    </Text>
                    <Text fw={950} style={{ fontVariantNumeric: "tabular-nums" }}>
                      {fmt1(rating ?? NaN)}
                    </Text>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <Text size="sm" c="dimmed" style={{ marginTop: 6 }}>
            선택한 날짜의 게임이 없습니다.
          </Text>
        )}
      </div>
      ) : null}
    </Card>
  );
}
