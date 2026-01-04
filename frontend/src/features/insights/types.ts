// src/features/insights/types.ts

export type InsightStatus = "데이터부족" | "매우좋음" | "좋음" | "보통" | "부진" | "매우부진";

export type InsightStats = {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  recentAvg: number;    // score/inning 평균
  winRate: number;      // 무 제외 승률 %
  volatility: number;   // 표준편차 기반 기복
  delta: number;        // recentAvg - expected
};

export type InsightAnalysis = {
  gameType: string; // "ALL" 등
  sampleN: number;
  status: InsightStatus;
  recommendation: { handicapDelta: number; label: string };
  benchmark: { handicap: number; expected: number; min: number; max: number };
  stats: InsightStats | null;
  reasons: string[];
};

/**
 * ✅ "신버전 팀 지표" (backend buildTeamIndicators에서 나오는 형태)
 */
export type TeamIndicators = {
  sampleN: number;

  counts: {
    TEAM_LUCK_BAD: number;
    BUS: number;
    CARRY: number;
    SELF_ISSUE: number;
    NEUTRAL: number;
  };

  rates: {
    teamLuckBadRate: number;
    busRate: number;
    carryRate: number;
    selfIssueRate: number;
  };

  weighted: {
    luckBadScore: number;
    busScore: number;
    carryScore: number;
    selfIssueScore: number;
  };

  diffSummary: {
    avgDiff: number;
    overRate: number;
    underRate: number;
    meanOver: number;
    meanUnder: number;
  };

  extremes: {
    bestCarry: null | { gameId: string; date: string; diff: number; result: string };
    biggestBus: null | { gameId: string; date: string; diff: number; result: string };
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