import type { HandicapBenchmark } from "./types";

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

/**
 * avg(에버)로 "적정 핸디"를 추정한다.
 */
export function fitHandicapByAvg(
  avg: number,
  rows: HandicapBenchmark[] | null
): null | {
  suggested: HandicapBenchmark;      // 적정 핸디 1개
  mode: "IN_RANGE" | "BELOW_RANGE" | "ABOVE_RANGE";
  position01: number;               // 구간 내 위치(0~1)
  positionPct: number;              // 0~100
  distanceToExpected: number;       // |avg - expected|
  inRangeCandidates: HandicapBenchmark[]; // avg가 들어간 모든 후보(디버그/설명용)
} {
  if (!rows?.length || !Number.isFinite(avg)) return null;

  const a = avg;

  // 1) avg가 min~max 안에 들어가는 후보들
  const inRange = rows.filter((b) => a >= b.min && a <= b.max);

  // 2) 적정 핸디 선택: (우선) inRange 중 expected 가장 가까운 것
  const pickBest = (cands: HandicapBenchmark[]) => {
    return cands
      .map((b) => ({ b, d: Math.abs(a - b.expected) }))
      .sort((x, y) => x.d - y.d)[0];
  };

  let chosen: HandicapBenchmark;
  let mode: "IN_RANGE" | "BELOW_RANGE" | "ABOVE_RANGE";

  if (inRange.length) {
    chosen = pickBest(inRange).b;
    mode = "IN_RANGE";
  } else {
    // 3) 어떤 구간에도 없으면 expected가 가장 가까운 핸디
    chosen = pickBest(rows).b;
    mode = a < chosen.min ? "BELOW_RANGE" : "ABOVE_RANGE";
  }

  // 4) 선택된 핸디에서 구간 내 위치 계산
  const denom = Math.max(1e-9, chosen.max - chosen.min);
  const position01 = clamp01((a - chosen.min) / denom);
  const positionPct = position01 * 100;

  return {
    suggested: chosen,
    mode,
    position01,
    positionPct,
    distanceToExpected: Math.abs(a - chosen.expected),
    inRangeCandidates: inRange,
  };
}