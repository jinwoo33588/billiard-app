import React, { useMemo } from "react";
import { Card, Group, Text, Badge } from "@mantine/core";

/**
 * 백엔드 예시:
 * {
 *   handicapScore: {
 *     handicap: 26,
 *     scores: { total: 94.02 },
 *     verdict: { delta: 0, text: "적정" },
 *     benchmark: { expected: 0.59, min: 0.575, max: 0.615 }
 *   }
 * }
 */

type Benchmark = {
  expected: number;
  min: number;
  max: number;
  mode?: "exact" | "interp" | "clamp";
};

type HandicapScore = {
  handicap: number;
  benchmark?: Benchmark;
  scores?: {
    total: number;
    avgScore?: number;
    winScore?: number;
  };
  verdict?: {
    band?: string;
    delta?: number; // -2,-1,0,+1,+2...
    text?: string;  // "적정" 등
  };
  inputs?: {
    avg?: number;
    winRate?: number;
  };
};

type Props = {
  /** ✅ 추천: response 통째로 넘기기 */
  data?: any;
  /** ✅ 또는 handicapScore만 넘겨도 됨 */
  handicapScore?: HandicapScore | null;
  /** 내 주변 핸디 범위(기본 ±2) */
  span?: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

function fmt1(n: number) {
  return Number.isFinite(n) ? n.toFixed(1) : "-";
}

function badgeTone(text: string) {
  // 딱딱하지 않게 톤만 잡는 정도
  if (text.includes("강제") || text.includes("다운")) return { color: "red", variant: "light" as const };
  if (text.includes("업") || text.includes("+")) return { color: "green", variant: "light" as const };
  return { color: "gray", variant: "light" as const };
}

function Track({
  handicap,
  suggestedDelta,
  span = 2,
}: {
  handicap: number;
  suggestedDelta: number;
  span?: number;
}) {
  const left = handicap - span;
  const right = handicap + span;
  const steps = Array.from({ length: right - left + 1 }, (_, i) => left + i);

  const suggested = handicap + suggestedDelta;

  const trackW = 100;
  const pos = (h: number) => {
    const t = (clamp(h, left, right) - left) / (right - left || 1);
    return t * trackW;
  };

  const myX = pos(handicap);
  const sugX = pos(suggested);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {/* 숫자 라벨 */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "0 2px" }}>
        {steps.map((h) => (
          <Text
            key={h}
            size="xs"
            fw={h === handicap ? 900 : 700}
            c={h === handicap ? undefined : "dimmed"}
            style={{ width: `${100 / steps.length}%`, textAlign: "center" }}
          >
            {h}
          </Text>
        ))}
      </div>

      {/* 트랙 + 마커 */}
      <div style={{ position: "relative", height: 18 }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 7,
            height: 4,
            borderRadius: 999,
            background: "rgba(0,0,0,0.08)",
          }}
        />

        {/* 추천 핸디(작은 점) */}
        <div
          title={`추천: ${handicap + suggestedDelta}`}
          style={{
            position: "absolute",
            top: 2,
            left: `calc(${sugX}% - 5px)`,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "rgba(0,0,0,0.35)",
          }}
        />

        {/* 내 핸디(큰 점) */}
        <div
          title={`현재: ${handicap}`}
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${myX}% - 8px)`,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "white",
            border: "2px solid rgba(0,0,0,0.55)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.10)",
          }}
        />
      </div>

      {/* 레전드 */}
      <Group gap={10} wrap="wrap">
        <Group gap={6}>
          <div style={{ width: 12, height: 12, borderRadius: 999, border: "2px solid rgba(0,0,0,0.55)", background: "white" }} />
          <Text size="xs" c="dimmed">현재</Text>
        </Group>
        <Group gap={6}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(0,0,0,0.35)" }} />
          <Text size="xs" c="dimmed">추천</Text>
        </Group>
      </Group>
    </div>
  );
}

export default function HandicapScoreCard({ data, handicapScore, span = 2 }: Props) {
  // ✅ 여기서 “뭐가 오든” handicapScore를 찾아서 정규화
  const hs: HandicapScore | null =
    handicapScore ??
    data?.handicapScore ??
    // 혹시 api가 handicapScore만 바로 내려주는 형태면 그것도 수용
    (data?.handicap ? data : null);

  const safe = useMemo(() => {
    if (!hs) return null;

    const handicap = Number(hs.handicap);
    const total = Number(hs.scores?.total);

    const delta = Number(hs.verdict?.delta ?? 0);
    const text = String(hs.verdict?.text ?? "");

    return {
      handicap: Number.isFinite(handicap) ? handicap : 0,
      total: Number.isFinite(total) ? total : 0,
      delta: Number.isFinite(delta) ? delta : 0,
      text,
      expected: hs.benchmark?.expected,
    };
  }, [hs]);

  if (!safe) {
    return (
      <Card withBorder radius="md" p="sm">
        <Text fw={900}>핸디 평가</Text>
        <Text size="sm" c="dimmed" mt={6}>
          데이터가 없습니다. (props로 <code>data</code> 또는 <code>handicapScore</code>를 전달해야 함)
        </Text>
      </Card>
    );
  }

  const verdictTone = badgeTone(safe.text || "적정");

  return (
    <Card
      withBorder
      radius="md"
      p="sm"
      style={{
        background: "rgba(255,255,255,0.9)",
        borderColor: "rgba(0,0,0,0.08)",
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div style={{ minWidth: 0 }}>
          <Text fw={950} style={{ letterSpacing: -0.3, lineHeight: 1.1 }}>
            핸디 평가
          </Text>
          <Text size="xs" c="dimmed" mt={3}>
            현재 HCP {safe.handicap}
            {typeof safe.expected === "number" ? ` · 기대 AVG ${safe.expected}` : ""}
          </Text>
        </div>

        <Badge radius="xl" variant={verdictTone.variant} color={verdictTone.color}>
          {safe.text || "적정"}
        </Badge>
      </Group>

      <div style={{ marginTop: 14 }}>
        <Track handicap={safe.handicap} suggestedDelta={safe.delta} span={span} />
      </div>

      <Group justify="space-between" align="baseline" mt={14}>
        <Text size="xs" c="dimmed" fw={800}>
          총점
        </Text>
        <Text
          fw={950}
          style={{
            fontSize: 30,
            letterSpacing: -0.6,
            fontVariantNumeric: "tabular-nums",
            lineHeight: 1,
          }}
        >
          {fmt1(safe.total)}
        </Text>
      </Group>
    </Card>
  );
}