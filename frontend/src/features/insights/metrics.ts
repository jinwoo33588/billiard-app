import type { InsightAnalysis, TeamIndicators } from './types';

export function statusMeta(status: InsightAnalysis['status']) {
  switch (status) {
    case '매우좋음':
      return { color: 'green', label: '매우 좋음', emoji: '🔥' } as const;
    case '좋음':
      return { color: 'teal', label: '좋음', emoji: '⬆️' } as const;
    case '보통':
      return { color: 'blue', label: '보통', emoji: '➖' } as const;
    case '부진':
      return { color: 'orange', label: '부진', emoji: '⬇️' } as const;
    case '매우부진':
      return { color: 'red', label: '매우 부진', emoji: '🧊' } as const;
    case '데이터부족':
    default:
      return { color: 'gray', label: '데이터 부족', emoji: '🧪' } as const;
  }
}

export function fmt(n: number | null | undefined, d: number) {
  if (n === null || n === undefined || Number.isNaN(Number(n))) return '-';
  return Number(n).toFixed(d);
}

export function getConfidence(sampleN: number) {
  let level: '높음' | '보통' | '낮음' = '낮음';
  if (sampleN >= 20) level = '높음';
  else if (sampleN >= 10) level = '보통';
  const color = level === '높음' ? 'green' : level === '보통' ? 'blue' : 'gray';
  return { level, color } as const;
}

// delta(-0.10~+0.10) -> 0~100
export function skillScoreFromDelta(delta: number) {
  const v = Math.max(-0.1, Math.min(0.1, Number(delta)));
  return Math.round(((v + 0.1) / 0.2) * 100);
}

// std(0.06~0.14) -> 100~0
export function stabilityScoreFromStd(std: number) {
  const v = Number(std);
  if (!Number.isFinite(v)) return 0;
  const min = 0.06;
  const max = 0.14;
  const t = Math.min(1, Math.max(0, (v - min) / (max - min)));
  return Math.round((1 - t) * 100);
}

// 팀운 점수: 할만패(가중 1.0) + 덜승(가중 0.6) -> 0~100
export function teamLuckScoreFromRates(rates: TeamIndicators['rates'], sampleN: number) {
  if (!rates || sampleN < 5) return null;
  const bad = Number(rates.teamLuckBadRate) || 0;
  const carry = Number(rates.teamCarryRate) || 0;
  const raw = bad * 1.0 + carry * 0.6;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

export function splitReasons(reasons: string[], topN = 2) {
  return { top: reasons.slice(0, topN), rest: reasons.slice(topN) };
}