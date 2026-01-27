import React, { useMemo } from "react";
import { Group, Text, Badge } from "@mantine/core";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/**
 * 핸디 주변(-2~+2)을 x축으로 표시하는 트랙
 * - current: 현재 핸디 위치(항상 가운데)
 * - suggestedDelta: 추천 변화량(-3~+3 등) -> 범위 밖이면 끝에 붙음
 */
export default function HandicapNeighborhoodTrack({
  handicap,
  suggestedDelta = 0,
  span = 2,
}: {
  handicap: number;           // 내 현재 핸디 (예: 26)
  suggestedDelta?: number;    // 추천 delta (예: +1, -1, +3...)
  span?: number;              // 기본 2면 -2~+2
}) {
  const ui = useMemo(() => {
    const start = handicap - span;
    const end = handicap + span;
    const count = end - start; // ex) 4 (26-2 ~ 26+2)

    const ticks = Array.from({ length: count + 1 }, (_, i) => start + i);

    // 현재 핸디는 항상 가운데(= handicap)
    const cur = handicap;

    // 추천 핸디
    const sugRaw = handicap + (Number.isFinite(suggestedDelta) ? suggestedDelta : 0);
    const sug = clamp(sugRaw, start, end);

    // 0..1 위치로 변환
    const toT = (h: number) => (count <= 0 ? 0 : (h - start) / count);

    return {
      start,
      end,
      ticks,
      curT: toT(cur),
      sugT: toT(sug),
      sugRaw,
      sug,
      sugClamped: sugRaw !== sug,
    };
  }, [handicap, suggestedDelta, span]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* 상단 라벨 */}
      <Group justify="space-between" align="center" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text size="xs" c="dimmed" fw={900}>
            주변 핸디캡
          </Text>
          <Text fw={950} style={{ letterSpacing: -0.2, lineHeight: 1.1 }}>
            {ui.start} ~ {ui.end}
          </Text>
        </div>

        <Group gap={8} wrap="nowrap">
          <Badge radius="xl" variant="light" style={{ fontWeight: 900 }}>
            내 핸디 {handicap}
          </Badge>
          {suggestedDelta !== 0 ? (
            <Badge radius="xl" variant="light" color="gray" style={{ fontWeight: 900 }}>
              추천 {suggestedDelta > 0 ? `+${suggestedDelta}` : suggestedDelta}
              {ui.sugClamped ? " (범위밖)" : ""}
            </Badge>
          ) : null}
        </Group>
      </Group>

      {/* 트랙 */}
      <div
        style={{
          position: "relative",
          height: 14,
          borderRadius: 999,
          background: "rgba(0,0,0,0.06)",
          border: "1px solid rgba(0,0,0,0.10)",
        }}
      >
        {/* tick 점들 */}
        {ui.ticks.map((h) => {
          const t = (h - ui.start) / (ui.end - ui.start || 1);
          const isCenter = h === handicap;
          return (
            <div
              key={h}
              style={{
                position: "absolute",
                left: `calc(${t * 100}% - 3px)`,
                top: "50%",
                transform: "translateY(-50%)",
                width: 6,
                height: 6,
                borderRadius: 999,
                background: isCenter ? "rgba(0,0,0,0.35)" : "rgba(0,0,0,0.18)",
              }}
              aria-label={`tick-${h}`}
            />
          );
        })}

        {/* ✅ 추천 마커(있을 때만): 얇은 링 */}
        {suggestedDelta !== 0 ? (
          <div
            style={{
              position: "absolute",
              left: `calc(${ui.sugT * 100}% - 9px)`,
              top: "50%",
              transform: "translateY(-50%)",
              width: 18,
              height: 18,
              borderRadius: 999,
              border: "2px solid rgba(0,0,0,0.35)",
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
            }}
            aria-label="suggested"
          />
        ) : null}

        {/* ✅ 내 핸디 마커(진한 점) - 항상 가운데 */}
        <div
          style={{
            position: "absolute",
            left: `calc(${ui.curT * 100}% - 9px)`,
            top: "50%",
            transform: "translateY(-50%)",
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "var(--mantine-color-dark-9)",
            border: "2px solid rgba(255,255,255,0.92)",
            boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
          }}
          aria-label="current"
        />
      </div>

      {/* tick 라벨 */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {ui.ticks.map((h) => (
          <Text
            key={h}
            size="xs"
            c={h === handicap ? "dark" : "dimmed"}
            fw={h === handicap ? 900 : 700}
            style={{ width: 1, transform: "translateX(-50%)" }} // 왼쪽부터 균등 정렬 느낌
          >
            {h}
          </Text>
        ))}
      </div>
    </div>
  );
}