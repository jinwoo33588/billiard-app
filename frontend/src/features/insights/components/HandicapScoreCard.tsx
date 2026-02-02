import { useMemo, useState } from "react";
import { Group, Text, Badge, Button, Modal, Divider, Table } from "@mantine/core";
import InsightCardShell from "./InsightCardShell";
import { fmt1, fmt3, fmtPct } from "../../../shared/utils/number";
import { HANDICAP_BENCHMARKS } from "../handicapBenchmarks";

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
  deltas?: {
    avgDelta?: number;
    avgRatio?: number;
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


function badgeTone(text: string) {
  // 딱딱하지 않게 톤만 잡는 정도
  if (text.includes("강제") || text.includes("다운")) return { color: "red", variant: "light" as const };
  if (text.includes("업") || text.includes("+")) return { color: "green", variant: "light" as const };
  return { color: "gray", variant: "light" as const };
}

function Track({
  handicap,
  suggestedDelta,
  totalScore,
  span = 2,
}: {
  handicap: number;
  suggestedDelta: number;
  totalScore?: number;
  span?: number;
}) {
  const left = handicap - span;
  const right = handicap + span;
  const steps = Array.from({ length: right - left + 1 }, (_, i) => left + i);

  let fineOffset = 0;
  if (typeof totalScore === "number") {
    if (totalScore >= 90) {
      const t = clamp((totalScore - 90) / 15, 0, 1);
      fineOffset = t * 0.45;
    } else {
      const t = clamp((90 - totalScore) / 10, 0, 1);
      fineOffset = -t * 0.45;
    }
  }

  const suggested = handicap + suggestedDelta + fineOffset;

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
            background: "rgba(0,0,0,0.06)",
          }}
        />

        {/* 추천 핸디(큰 점) */}
        <div
          title={`추천: ${handicap + suggestedDelta}`}
          style={{
            position: "absolute",
            top: 0,
            left: `calc(${sugX}% - 8px)`,
            width: 16,
            height: 16,
            borderRadius: 999,
            background: "white",
            border: "2px solid rgba(72, 149, 255, 0.9)",
            boxShadow: "0 6px 16px rgba(72, 149, 255, 0.3)",
          }}
        />

        {/* 내 핸디(작은 점) */}
        <div
          title={`현재: ${handicap}`}
          style={{
            position: "absolute",
            top: 2,
            left: `calc(${myX}% - 5px)`,
            width: 10,
            height: 10,
            borderRadius: 999,
            background: "rgba(0,0,0,0.35)",
          }}
        />
      </div>

      {/* 레전드 */}
      <Group gap={10} wrap="wrap">
        <Group gap={6}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              border: "2px solid rgba(72, 149, 255, 0.9)",
              background: "white",
            }}
          />
          <Text size="xs" c="dimmed">추천</Text>
        </Group>
        <Group gap={6}>
          <div style={{ width: 10, height: 10, borderRadius: 999, background: "rgba(0,0,0,0.35)" }} />
          <Text size="xs" c="dimmed">현재</Text>
        </Group>
      </Group>
    </div>
  );
}

export default function HandicapScoreCard({ data, handicapScore, span = 2 }: Props) {
  const [openGuide, setOpenGuide] = useState(false);

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

    const avgInput = Number(hs.inputs?.avg);
    const winInput = Number(hs.inputs?.winRate);
    const avgScore = Number(hs.scores?.avgScore);
    const winScore = Number(hs.scores?.winScore);
    const avgDelta = Number(hs.deltas?.avgDelta);
    const avgRatio = Number(hs.deltas?.avgRatio);

    const gamesCountRaw = Number(data?.stats?.gamesCount);

    return {
      handicap: Number.isFinite(handicap) ? handicap : 0,
      total: Number.isFinite(total) ? total : 0,
      delta: Number.isFinite(delta) ? delta : 0,
      text,
      expected: hs.benchmark?.expected,
      min: hs.benchmark?.min,
      max: hs.benchmark?.max,
      avgInput: Number.isFinite(avgInput) ? avgInput : undefined,
      winInput: Number.isFinite(winInput) ? winInput : undefined,
      avgScore: Number.isFinite(avgScore) ? avgScore : undefined,
      winScore: Number.isFinite(winScore) ? winScore : undefined,
      avgDelta: Number.isFinite(avgDelta) ? avgDelta : undefined,
      avgRatio: Number.isFinite(avgRatio) ? avgRatio : undefined,
      gamesCount: Number.isFinite(gamesCountRaw) ? gamesCountRaw : undefined,
    };
  }, [hs, data?.stats?.gamesCount]);

  if (!safe) {
    return (
      <InsightCardShell>
        <Text fw={900}>핸디 평가</Text>
        <Text size="sm" c="dimmed" mt={6}>
          데이터가 없습니다. (props로 <code>data</code> 또는 <code>handicapScore</code>를 전달해야 함)
        </Text>
      </InsightCardShell>
    );
  }

  const verdictTone = badgeTone(safe.text || "적정");
  const winPct = fmtPct(safe.winInput, 0, "-");
  const reason =
    typeof safe.avgScore === "number" && typeof safe.winScore === "number"
      ? safe.avgScore >= safe.winScore
        ? "AVG 영향이 더 큼"
        : "승률 영향이 더 큼"
      : null;
  const guideBenchmark = HANDICAP_BENCHMARKS.find((item) => item.handicap === safe.handicap);
  const guideMax = typeof safe.max === "number" ? safe.max : guideBenchmark?.max;
  const guideExpected = typeof safe.expected === "number" ? safe.expected : guideBenchmark?.expected;
  const winScoreFromRate = (rate: number) => clamp(10 * rate, 0, 10);
  const guideAvgScore =
    typeof safe.avgInput === "number" && typeof guideMax === "number" && guideMax > 0
      ? 90 * (safe.avgInput / guideMax)
      : undefined;
  const guideWinScore =
    typeof safe.winInput === "number" ? winScoreFromRate(safe.winInput) : undefined;
  const guideTotal =
    typeof guideAvgScore === "number" && typeof guideWinScore === "number"
      ? guideAvgScore + guideWinScore
      : undefined;

  return (
    <InsightCardShell>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Text fw={950} style={{ letterSpacing: -0.3, lineHeight: 1.1 }}>
          핸디 평가
        </Text>

        <Group gap={8} wrap="nowrap">
          <Button size="xs" variant="subtle" onClick={() => setOpenGuide(true)}>
            핸디 기준표
          </Button>
          <Badge
            radius="xl"
            variant={verdictTone.variant}
            color={verdictTone.color}
            style={{ border: "1px solid rgba(0,0,0,0.08)" }}
          >
            {safe.text || "적정"}
          </Badge>
        </Group>
      </Group>

      <Text size="xs" c="dimmed" mt={4}>
        {safe.handicap}점
        {typeof safe.expected === "number" ? ` · 기대 AVG ${fmt3(safe.expected)}` : ""}
        {typeof safe.gamesCount === "number" ? ` · ${safe.gamesCount}판 기준` : ""}
      </Text>

      <div style={{ marginTop: 14 }}>
        <Track
          handicap={safe.handicap}
          suggestedDelta={safe.delta}
          totalScore={safe.total}
          span={span}
        />
      </div>

      <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
        <Text size="xs" c="dimmed" fw={900}>
          입력 지표
        </Text>
        <Group gap={10} wrap="wrap">
          <InfoPill
            label="AVG"
            value={fmt3(safe.avgInput)}
            sub={typeof safe.avgScore === "number" ? `점수 ${fmt1(safe.avgScore)}` : undefined}
          />
          <InfoPill
            label="승률"
            value={winPct === "-" ? "-" : `${winPct}%`}
            sub={typeof safe.winScore === "number" ? `점수 ${fmt1(safe.winScore)}` : undefined}
          />
        </Group>

        <Text size="xs" c="dimmed">
          추천 근거: {safe.text || "적정"}
          {reason ? ` · ${reason}` : ""}
          {typeof safe.avgDelta === "number" ? ` · AVG Δ ${fmt3(safe.avgDelta)}` : ""}
        </Text>
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

      <Modal
        opened={openGuide}
        onClose={() => setOpenGuide(false)}
        title="핸디 기준표"
        size="lg"
        centered
      >
        <Text size="sm" c="dimmed">
          핸디별 기대 AVG와 점수 계산 흐름을 요약했습니다.
        </Text>

        <Divider my="md" />

        <Text fw={800} size="sm" mb={6}>
          1) 핸디별 기대 AVG
        </Text>
        <Table striped withRowBorders={false}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>핸디</Table.Th>
              <Table.Th>기대 AVG</Table.Th>
              <Table.Th>하한</Table.Th>
              <Table.Th>상한</Table.Th>
            </Table.Tr>
          </Table.Thead>
        <Table.Tbody>
          {HANDICAP_BENCHMARKS.map((item) => (
            <Table.Tr key={item.handicap}>
              <Table.Td
                style={
                  item.handicap === safe.handicap
                    ? { background: "rgba(72, 149, 255, 0.12)", fontWeight: 900 }
                    : undefined
                }
              >
                {item.handicap}
              </Table.Td>
              <Table.Td
                style={
                  item.handicap === safe.handicap
                    ? { background: "rgba(72, 149, 255, 0.12)", fontWeight: 900 }
                    : undefined
                }
              >
                {fmt3(item.expected)}
              </Table.Td>
              <Table.Td
                style={
                  item.handicap === safe.handicap
                    ? { background: "rgba(72, 149, 255, 0.12)", fontWeight: 900 }
                    : undefined
                }
              >
                {fmt3(item.min)}
              </Table.Td>
              <Table.Td
                style={
                  item.handicap === safe.handicap
                    ? { background: "rgba(72, 149, 255, 0.12)", fontWeight: 900 }
                    : undefined
                }
              >
                {fmt3(item.max)}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        </Table>

        <Divider my="md" />

        <Text fw={800} size="sm" mb={6}>
          2) 점수 계산 (간략)
        </Text>
        <Text size="sm" c="dimmed">
          AVG 점수 = 90 × (본인 AVG / 해당 핸디의 상한 AVG)
        </Text>
        <Text size="sm" c="dimmed">
          승률 점수 = clamp(10 × 승률, 0~10) · 평균 승률 66.6% 기준
        </Text>
        <Text size="sm" c="dimmed">
          총점 = AVG 점수 + 승률 점수
        </Text>

        {typeof guideAvgScore === "number" || typeof guideWinScore === "number" ? (
          <div style={{ marginTop: 10 }}>
            <Text size="xs" c="dimmed" fw={800}>
              내 데이터 예시
            </Text>
            <Text size="sm">
              AVG {typeof safe.avgInput === "number" ? fmt3(safe.avgInput) : "-"} /
              상한 {typeof guideMax === "number" ? fmt3(guideMax) : "-"} →
              AVG 점수 {typeof guideAvgScore === "number" ? fmt1(guideAvgScore) : "-"}
            </Text>
            <Text size="sm">
              승률 {winPct === "-" ? "-" : `${winPct}%`} → 승률 점수{" "}
              {typeof guideWinScore === "number" ? fmt1(guideWinScore) : "-"}
            </Text>
            <Text size="sm">
              총점 {typeof guideTotal === "number" ? fmt1(guideTotal) : "-"}
            </Text>
          </div>
        ) : null}

        <Divider my="md" />

        <Text fw={800} size="sm" mb={6}>
          3) 점수대별 핸디 추천
        </Text>
        <div style={{ display: "grid", gap: 6 }}>
          <Text size="sm">105+ : 강제 핸디업</Text>
          <Text size="sm">100~105 : +1 권장</Text>
          <Text size="sm">95~100 : 평균보다 약간 높음</Text>
          <Text size="sm">90~95 : 적정</Text>
          <Text size="sm">85~90 : 평균보다 약간 낮음</Text>
          <Text size="sm">80~85 : -1 권장</Text>
          <Text size="sm">&lt;80 : 강제 핸디다운</Text>
        </div>

        {typeof guideExpected === "number" ? (
          <Text size="xs" c="dimmed" mt="md">
            참고: 현재 핸디({safe.handicap}) 기대 AVG는 {fmt3(guideExpected)} 입니다.
          </Text>
        ) : null}
      </Modal>
    </InsightCardShell>
  );
}

function InfoPill({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 999,
        border: "1px solid rgba(0,0,0,0.08)",
        background: "rgba(255,255,255,0.92)",
      }}
    >
      <Text size="xs" c="dimmed" fw={900}>
        {label}
      </Text>
      <Text fw={950} style={{ fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>
        {value}
      </Text>
      {sub ? (
        <Text size="xs" c="dimmed" fw={800}>
          {sub}
        </Text>
      ) : null}
    </div>
  );
}
