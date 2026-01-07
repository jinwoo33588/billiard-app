// src/features/insights/normalize.ts
import type { TeamIndicators } from "./types";

function num(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * ✅ 서버 응답이 구버전/신버전 섞여도, 프론트는 "항상 V2"로만 사용
 */
export function normalizeTeamIndicators(raw: any): TeamIndicators {
  const sampleN = num(raw?.sampleN, 0);

  const countsRaw = raw?.counts || {};
  const ratesRaw = raw?.rates || {};
  const wRaw = raw?.weighted || {};

  // counts (구버전 키도 흡수)
  const TEAM_LUCK_BAD = num(countsRaw.TEAM_LUCK_BAD, 0);
  const BUS = num(countsRaw.BUS ?? countsRaw.TEAM_CARRY, 0);
  const SELF_ISSUE = num(countsRaw.SELF_ISSUE ?? countsRaw.NEED_IMPROVE, 0);
  const CARRY = num(countsRaw.CARRY ?? countsRaw.TEAM_SYNERGY_GOOD, 0);
  const NEUTRAL = num(countsRaw.NEUTRAL, 0);

  // rates (구버전 키도 흡수)
  const teamLuckBadRate = num(ratesRaw.teamLuckBadRate, 0);
  const busRate = num(ratesRaw.busRate ?? ratesRaw.teamCarryRate, 0);
  const selfIssueRate = num(ratesRaw.selfIssueRate ?? ratesRaw.needImproveRate, 0);
  const carryRate = num(ratesRaw.carryRate ?? ratesRaw.synergyWinRate, 0);

  // weighted (구버전 키도 흡수)
  const luckBadScore = num(wRaw.luckBadScore, 0);
  const busScore = num(wRaw.busScore ?? wRaw.carryScore, 0); // 구버전 carryScore를 busScore로 흡수
  const selfIssueScore = num(wRaw.selfIssueScore ?? wRaw.needImproveScore, 0);
  const carryScore = num(wRaw.carryScore ?? wRaw.synergyScore, 0);

  return {
    sampleN,
    headline: typeof raw?.headline === "string" ? raw.headline : "",
    note: raw?.note ? String(raw.note) : undefined,

    counts: { TEAM_LUCK_BAD, BUS, CARRY, SELF_ISSUE, NEUTRAL },
    rates: { teamLuckBadRate, busRate, carryRate, selfIssueRate },
    weighted: { luckBadScore, busScore, carryScore, selfIssueScore },

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