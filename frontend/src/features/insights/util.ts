// features/insights/utils.ts
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

// -------------------------------
// ✅ 여기부터가 핵심 패치
// -------------------------------
function num(v: any, fallback = 0) {
  const x = Number(v);
  return Number.isFinite(x) ? x : fallback;
}

/**
 * ✅ 백엔드 신버전(BUS/CARRY/SELF_ISSUE) → 기존 틀(TEAM_CARRY/NEED_IMPROVE/TEAM_SYNERGY_GOOD)로 흡수
 *
 * 기존 프론트 의미(너가 만든 배지 로직) 유지:
 * - TEAM_LUCK_BAD: 잘했는데 짐(억울)
 * - TEAM_CARRY: "덜승/버스" 느낌(기존 carryRate/carryScore)
 * - NEED_IMPROVE: 못했는데 짐(내 문제)
 * - TEAM_SYNERGY_GOOD: 잘해서 이김(기여/시너지)
 */
export function normalizeTeamIndicators(raw: any): TeamIndicators {
  const sampleN = num(raw?.sampleN, 0);

  const countsRaw = raw?.counts || {};
  const ratesRaw = raw?.rates || {};
  const wRaw = raw?.weighted || {};

  // 신버전 값 우선
  const luckBadCount = num(countsRaw.TEAM_LUCK_BAD, 0);
  const busCount = num(countsRaw.BUS ?? countsRaw.TEAM_CARRY, 0);
  const selfIssueCount = num(countsRaw.SELF_ISSUE ?? countsRaw.NEED_IMPROVE, 0);
  const synergyCount = num(countsRaw.CARRY ?? countsRaw.TEAM_SYNERGY_GOOD, 0);

  const luckBadRate = num(ratesRaw.teamLuckBadRate, 0);
  const busRate = num(ratesRaw.busRate ?? ratesRaw.teamCarryRate, 0);
  const selfRate = num(ratesRaw.selfIssueRate ?? ratesRaw.needImproveRate, 0);
  const synergyRate = num(ratesRaw.carryRate ?? ratesRaw.synergyWinRate, 0);

  const luckBadScore = num(wRaw.luckBadScore, 0);
  const busScore = num(wRaw.busScore ?? wRaw.carryScore, 0); // 기존 carryScore를 버스 강도로 사용하던 틀 유지
  const selfScore = num(wRaw.selfIssueScore ?? wRaw.needImproveScore, 0);
  const synergyScore = num(wRaw.carryScore ?? wRaw.synergyScore, 0); // 신버전 carryScore(기여) 우선

  return {
    sampleN,
    headline: String(raw?.headline || ''),
    note: raw?.note ? String(raw.note) : undefined,
    counts: {
      TEAM_LUCK_BAD: luckBadCount,
      TEAM_CARRY: busCount,
      NEED_IMPROVE: selfIssueCount,
      TEAM_SYNERGY_GOOD: synergyCount,

      // 신버전도 보존(디버깅/나중 UI 확장용)
      BUS: countsRaw.BUS,
      CARRY: countsRaw.CARRY,
      SELF_ISSUE: countsRaw.SELF_ISSUE,
      NEUTRAL: countsRaw.NEUTRAL,
    },
    rates: {
      teamLuckBadRate: luckBadRate,
      teamCarryRate: busRate,
      needImproveRate: selfRate,
      synergyWinRate: synergyRate,

      busRate: ratesRaw.busRate,
      carryRate: ratesRaw.carryRate,
      selfIssueRate: ratesRaw.selfIssueRate,
    },
    weighted: {
      luckBadScore,
      carryScore: busScore,
      needImproveScore: selfScore,
      synergyScore,

      busScore: wRaw.busScore,
      selfIssueScore: wRaw.selfIssueScore,
    },
    diffSummary: {
      avgDiff: num(raw?.diffSummary?.avgDiff, 0),
      overRate: num(raw?.diffSummary?.overRate, 0),
      underRate: num(raw?.diffSummary?.underRate, 0),
      meanOver: num(raw?.diffSummary?.meanOver, 0),
      meanUnder: num(raw?.diffSummary?.meanUnder, 0),
    },
    extremes: {
      bestCarry: raw?.extremes?.bestCarry ?? null,
      biggestBus: raw?.extremes?.biggestBus ?? null,
    },
  };
}