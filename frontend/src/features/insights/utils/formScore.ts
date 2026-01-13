// frontend/src/features/insights/utils/formScore.ts
import type { HandicapBenchmark } from "../meta/types";

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function calcFormScore({
  recentAvg,
  expectedAvg,
  winRate, // 0~100
}: {
  recentAvg: number;
  expectedAvg: number;
  winRate: number;
}) {
  const expected = expectedAvg > 0 ? expectedAvg : 1;

  const avgScoreRaw = 90 * (recentAvg / expected);
  const avgScore = clamp(avgScoreRaw, 0, 110);

  const winScore = clamp(winRate / 10, 0, 10);

  const total = avgScore + winScore;

  // 보기 좋게 70~110 => 0~100
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
 * (옵션) total이 target에 가장 가까워지는 핸디를 추정
 */
export function estimateHandicapByFormScore({
  recentAvg,
  winRate,
  rows,
  target = 92.5,
}: {
  recentAvg: number;
  winRate: number;
  rows: HandicapBenchmark[] | null;
  target?: number;
}) {
  if (!rows?.length) return null;

  let best = rows[0];
  let bestDist = Infinity;

  for (const b of rows) {
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

  return { suggested: best, target, bestDist };
}