// features/insights/types.ts
export type InsightAnalysis = {
  gameType: string;
  sampleN: number;
  status: '데이터부족' | '매우좋음' | '좋음' | '보통' | '부진' | '매우부진';
  recommendation: { handicapDelta: number; label: string };
  benchmark: { handicap: number; expected: number; min: number; max: number };
  stats: null | {
    totalGames: number;
    wins: number;
    draws: number;
    losses: number;
    recentAvg: number;
    winRate: number;
    volatility: number;
    delta: number;
  };
  reasons: string[];
};

export type TeamIndicators = {
  sampleN: number;
  counts: {
    TEAM_LUCK_BAD: number;
    TEAM_CARRY: number;
    NEED_IMPROVE: number;
    TEAM_SYNERGY_GOOD: number;

    // ✅ 백엔드 신버전(있어도 되고 없어도 됨)
    BUS?: number;
    CARRY?: number;
    SELF_ISSUE?: number;
    NEUTRAL?: number;
  };
  rates: {
    teamLuckBadRate: number;
    teamCarryRate: number;
    needImproveRate: number;
    synergyWinRate: number;

    // ✅ 신버전
    busRate?: number;
    carryRate?: number;
    selfIssueRate?: number;
  };
  weighted: {
    luckBadScore: number;
    carryScore: number;
    needImproveScore: number;
    synergyScore: number;

    // ✅ 신버전
    busScore?: number;
    selfIssueScore?: number;
  };
  diffSummary: {
    avgDiff: number;
    overRate: number;
    underRate: number;
    meanOver: number;
    meanUnder: number;
  };
  extremes: {
    bestCarry: null | { gameId: string; date: string; diff: number; result: '승' | '패' | '무' };
    biggestBus: null | { gameId: string; date: string; diff: number; result: '승' | '패' | '무' };
  };
  headline: string;
  note?: string;
};

export type InsightsResponse = {
  window: number;
  handicap: number;
  updatedAt: string;
  all: InsightAnalysis;
  teamIndicators: TeamIndicators;
};