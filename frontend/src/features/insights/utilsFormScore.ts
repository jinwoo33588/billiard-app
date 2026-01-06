import { HANDICAP_BENCHMARKS } from "./benchmarks";

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function calcFormScore({
  recentAvg,
  expectedAvg,
  winRate,
}: {
  recentAvg: number;
  expectedAvg: number;
  winRate: number; // 0~100
}) {
  const expected = expectedAvg > 0 ? expectedAvg : 1;

  const avgScoreRaw = 90 * (recentAvg / expected);
  const avgScore = clamp(avgScoreRaw, 0, 110);

  const winScore = clamp(winRate / 10, 0, 10);

  const total = avgScore + winScore;

  // Progress 표시용 (70~110 → 0~100)
  const progress = clamp(((total - 70) / 40) * 100, 0, 100);

  return { avgScore, winScore, total, progress };
}

export function formGrade(total: number) {
  if (total < 80) return { color: "red", label: "강제 핸디다운" } as const;
  if (total < 85) return { color: "orange", label: "핸디 다운 권장" } as const;
  if (total < 90) return { color: "yellow", label: "핸디보다 약간 낮음" } as const;
  if (total < 95) return { color: "gray", label: "핸디 평균" } as const;
  if (total < 100) return { color: "teal", label: "핸디보다 약간 높음" } as const;
  if (total < 105) return { color: "green", label: "핸디 업 권장" } as const;
  return { color: "blue", label: "강제 핸디업" } as const;
}

/**
 * ✅ 점수(total)가 90~95(핸디 평균 구간)에 가장 가까워지는 핸디를 추정
 * - recentAvg는 고정, winRate도 고정
 * - expectedAvg만 핸디별로 바뀌므로 "점수 기준 핸디"가 나옴
 */
export function estimateHandicapByScore({
  recentAvg,
  winRate,
  target = 92.5, // 90~95 중앙값
}: {
  recentAvg: number;
  winRate: number;
  target?: number;
}) {
  let best = HANDICAP_BENCHMARKS[0];
  let bestDist = Infinity;

  for (const b of HANDICAP_BENCHMARKS) {
    const { total } = calcFormScore({
      recentAvg,
      expectedAvg: b.expected,
      winRate,
    });
    const d = Math.abs(total - target);
    if (d < bestDist) {
      best = b;
      bestDist = d;
    }
  }
  return best; // {handicap, expected, min, max}
}