// frontend/src/utils/formBadges.ts
export type FormBadge = {
  label: string;
  color: string; // Mantine color
  hint?: string;
  valueText?: string; // 오른쪽에 숫자 표기
};

export function badgeFromMeanRating(meanRating: number | null): FormBadge {
  if (meanRating === null || !Number.isFinite(meanRating)) {
    return { label: "폼(평점) 부족", color: "gray", hint: "최근 rating 데이터가 부족합니다" };
  }

  // ✅ 너 rating 분포(대략 45~55)를 기준으로 일단 세팅. 필요하면 조정.
  if (meanRating >= 60) return { label: "폼(평점) 🔥", color: "grape", hint: "최근 평점이 매우 좋음", valueText: meanRating.toFixed(1) };
  if (meanRating >= 55) return { label: "폼(평점) ↑", color: "teal", hint: "최근 평점이 좋음", valueText: meanRating.toFixed(1) };
  if (meanRating >= 45) return { label: "폼(평점) →", color: "gray", hint: "평균적", valueText: meanRating.toFixed(1) };
  if (meanRating >= 40) return { label: "폼(평점) ↓", color: "orange", hint: "최근 평점이 낮음", valueText: meanRating.toFixed(1) };
  return { label: "폼(평점) 🧊", color: "red", hint: "최근 평점이 많이 낮음", valueText: meanRating.toFixed(1) };
}

export function badgeFromWinRate(winRate: number | null): FormBadge {
  if (winRate === null || !Number.isFinite(winRate)) {
    return { label: "승률 부족", color: "gray", hint: "최근 승률 데이터가 부족합니다" };
  }

  const pct = Math.round(winRate * 100);
  // ✅ 기준은 너 취향. (무 제외 승률이면 수치가 살짝 높게 나올 수 있음)
  if (winRate >= 0.72) return { label: "승률 🔥", color: "teal", hint: "최근 승률이 높음", valueText: `${pct}%` };
  if (winRate >= 0.68) return { label: "승률 ↑", color: "lime", hint: "최근 승률이 좋은 편", valueText: `${pct}%` };
  if (winRate >= 0.64) return { label: "승률 →", color: "gray", hint: "평균적", valueText: `${pct}%` };
  if (winRate >= 0.60) return { label: "승률 ↓", color: "orange", hint: "최근 승률이 낮음", valueText: `${pct}%` };
  return { label: "승률 🧊", color: "red", hint: "최근 승률이 매우 낮음", valueText: `${pct}%` };
}