// src/features/insights/utilsHandicap.ts
import { HANDICAP_BENCHMARKS } from "./benchmarks";

export function estimateHandicapByAvg(recentAvg: number) {
  // 1) min~max 안에 들어가는 후보들 먼저 찾기
  const inBand = HANDICAP_BENCHMARKS.filter(
    (b) => recentAvg >= b.min && recentAvg <= b.max
  );

  // 2) 후보가 있으면 expected에 가장 가까운 애 선택
  if (inBand.length > 0) {
    return inBand.reduce((best, cur) => {
      const bd = Math.abs(recentAvg - best.expected);
      const cd = Math.abs(recentAvg - cur.expected);
      return cd < bd ? cur : best;
    });
  }

  // 3) 후보가 없으면 expected에 가장 가까운 애 선택
  return HANDICAP_BENCHMARKS.reduce((best, cur) => {
    const bd = Math.abs(recentAvg - best.expected);
    const cd = Math.abs(recentAvg - cur.expected);
    return cd < bd ? cur : best;
  });
}