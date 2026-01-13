// frontend/src/features/insights/components/HandicapBandTrackFromInsights.tsx
import React, { useMemo } from "react";
import { Badge, Card, Group, Stack, Text, Divider } from "@mantine/core";
import type { InsightAll } from "../types";
import type { HandicapBenchmark } from "../../meta/types";
import { fitHandicapByAvg } from "../../meta/fitHandicap"; // ✅ 너 프로젝트 경로에 맞게

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}
function fmt3(x: number) {
  return Number.isFinite(x) ? x.toFixed(3) : "0.000";
}

function makeRange(myHandicap: number, suggestedHandicap: number) {
  const a = Math.round(Number(myHandicap) || 0);
  const b = Math.round(Number(suggestedHandicap) || 0);
  return { from: Math.min(a, b), to: Math.max(a, b) };
}

export default function HandicapBandTrackFromInsights({
  all,
  rows,
  showMyAvg = true,
}: {
  all: InsightAll;
  rows: HandicapBenchmark[] | null;
  showMyAvg?: boolean;
}) {
  const myHandicap = Math.round(Number(all?.benchmark?.handicap ?? 0));
  const avg = Number(all?.stats?.recentAvg);

  const fit = useMemo(() => fitHandicapByAvg(avg, rows), [avg, rows]);
  const suggestedHandicap = fit?.suggested?.handicap ?? myHandicap;

  const model = useMemo(() => {
    if (!rows?.length) return null;

    const map = new Map(rows.map((r) => [r.handicap, r]));
    const { from, to } = makeRange(myHandicap, suggestedHandicap);

    const items: HandicapBenchmark[] = [];
    for (let h = from; h <= to; h++) {
      const b = map.get(h);
      if (b) items.push(b);
    }
    if (!items.length) return null;

    const bandMin = Math.min(...items.map((b) => b.min));
    const bandMax = Math.max(...items.map((b) => b.max));

    // ✅ 내 avg 점: fit의 suggested 구간 안에서 위치 계산
    const target = fit?.suggested ?? items[0];
    const segCount = items.length;
    const segW = 1 / segCount;
    const idx = Math.max(0, items.findIndex((b) => b.handicap === target.handicap));

    const denom = Math.max(1e-9, target.max - target.min);
    const inner = clamp01((avg - target.min) / denom);
    const myDotPct = (idx * segW + inner * segW) * 100;

    const mode =
      Number.isFinite(avg) ? (avg < bandMin ? "BELOW_BAND" : avg > bandMax ? "ABOVE_BAND" : "IN_BAND") : "IN_BAND";

    return { items, segCount, myDotPct, bandMin, bandMax, mode, from, to };
  }, [rows, myHandicap, suggestedHandicap, avg, fit]);

  if (!model) return null;

  const { items, segCount, myDotPct, bandMin, bandMax, from, to } = model;

  const myH = myHandicap;
  const sugH = Math.round(Number(suggestedHandicap) || 0);

  const modeBadge = (() => {
    if (!fit) return { color: "gray", text: "계산중" as const };
    if (fit.mode === "IN_RANGE") return { color: "teal", text: "밴드 안" as const };
    if (fit.mode === "BELOW_RANGE") return { color: "blue", text: "밴드 아래" as const };
    return { color: "red", text: "밴드 위" as const };
  })();

  return (
    <Card withBorder radius="md" p="sm">
      <Stack gap="xs">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="xs">
          <div style={{ minWidth: 0 }}>
            <Text fw={900}>적정 핸디 밴드</Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              HCP {from} ~ {to} · avg {fmt3(avg)}
            </Text>
          </div>

          <Group gap={6} wrap="wrap" justify="flex-end">
            <Badge radius="xl" variant="light" color="gray">
              내 핸디 {myH}
            </Badge>
            <Badge radius="xl" variant="filled">
              추천 {sugH}
            </Badge>
            <Badge radius="xl" variant="light" color={modeBadge.color}>
              {modeBadge.text}
            </Badge>
          </Group>
        </Group>

        <Divider my="xs" />

        {/* track + expected dots */}
        <div style={{ marginTop: 6 }}>
          <div style={{ position: "relative", paddingTop: 22, paddingBottom: 18 }}>
            <div
              style={{
                display: "flex",
                height: 16,
                borderRadius: 999,
                overflow: "hidden",
                border: "1px solid rgba(0,0,0,0.08)",
                background: "var(--mantine-color-gray-1)",
              }}
            >
              {items.map((b) => {
                const isMy = b.handicap === myH;
                const isSug = b.handicap === sugH;
                const bg = isSug
                  ? "rgba(34,139,230,0.26)"
                  : isMy
                  ? "rgba(20,184,166,0.18)"
                  : "rgba(34,139,230,0.10)";
                return (
                  <div
                    key={b.handicap}
                    style={{
                      flex: 1,
                      background: bg,
                      borderRight: "1px solid rgba(0,0,0,0.06)",
                    }}
                  />
                );
              })}
            </div>

            {items.map((b, i) => {
              const segLeftPct = (i / segCount) * 100;
              const segW = (1 / segCount) * 100;

              const denom = Math.max(1e-9, b.max - b.min);
              const t = clamp01((b.expected - b.min) / denom);
              const leftPct = segLeftPct + t * segW;

              return (
                <React.Fragment key={`exp-${b.handicap}`}>
                  <div
                    style={{
                      position: "absolute",
                      left: `${leftPct}%`,
                      top: 0,
                      transform: "translate(-50%, 0)",
                      fontSize: 11,
                      fontWeight: 900,
                      color: "var(--mantine-color-blue-7)",
                      background: "rgba(255,255,255,0.92)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 999,
                      padding: "2px 7px",
                      whiteSpace: "nowrap",
                    }}
                    title={`HCP ${b.handicap} expected ${fmt3(b.expected)}`}
                  >
                    {fmt3(b.expected)}
                  </div>

                  <div
                    style={{
                      position: "absolute",
                      top: 30,
                      left: `${leftPct}%`,
                      transform: "translate(-50%, -50%)",
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: "var(--mantine-color-blue-6)",
                      border: "2px solid white",
                      boxShadow: "0 1px 6px rgba(0,0,0,0.16)",
                      zIndex: 2,
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: 44,
                      left: `${segLeftPct + segW / 2}%`,
                      transform: "translate(-50%, 0)",
                      fontSize: 11,
                      fontWeight: 900,
                      color:
                        b.handicap === sugH
                          ? "var(--mantine-color-blue-7)"
                          : b.handicap === myH
                          ? "var(--mantine-color-teal-7)"
                          : "var(--mantine-color-gray-6)",
                    }}
                  >
                    {b.handicap}
                  </div>
                </React.Fragment>
              );
            })}

            {/* 내 avg 점 */}
            {showMyAvg && Number.isFinite(avg) && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: 30,
                    left: `${myDotPct}%`,
                    transform: "translate(-50%, -50%)",
                    width: 18,
                    height: 18,
                    borderRadius: 999,
                    background: "var(--mantine-color-teal-6)",
                    border: "2px solid white",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.22)",
                    zIndex: 5,
                  }}
                  title={`내 avg ${fmt3(avg)}`}
                />
                <div
                  style={{
                    position: "absolute",
                    top: -2,
                    left: `${myDotPct}%`,
                    transform: "translate(-50%, -100%)",
                    zIndex: 6,
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 999,
                    padding: "2px 8px",
                    fontSize: 11,
                    fontWeight: 900,
                    whiteSpace: "nowrap",
                  }}
                >
                  avg {fmt3(avg)}
                </div>
              </>
            )}
          </div>
        </div>

        <Group justify="space-between" mt={2}>
          <Text size="xs" c="dimmed">
            밴드 min {fmt3(bandMin)}
          </Text>
          <Text size="xs" c="dimmed">
            밴드 max {fmt3(bandMax)}
          </Text>
        </Group>
      </Stack>
    </Card>
  );
}