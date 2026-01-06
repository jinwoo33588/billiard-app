export type InsightAll = {
  status: string;
  recommendation?: any;
  benchmark?: { handicap: number; expected: number; min?: number; max?: number };
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
  reasons?: string[];
};

export type TeamGameRow = {
  gameId: string;
  date: string | null;
  result: "WIN" | "LOSE";
  gameType: string;

  score: number;
  inning: number;

  avg: number;
  eff: number;
  expectedScore: number;
  vol: number;

  effScore: number;
  volScore: number;
  gps: number;

  label: "BUS" | "LUCK_BAD" | "CARRY" | "SELF_ISSUE" | "NEUTRAL";
};

export type TeamIndicators = {
  sampleN: number;
  benchmark: { handicap: number; expected: number };
  cuts: null | {
    eff: { p05: number; p95: number };
    vol: { p05: number; p95: number };
  };
  counts: { LUCK_BAD: number; BUS: number; SELF_ISSUE: number; CARRY: number; NEUTRAL: number };
  rates: { luckBadRate: number; busRate: number; selfIssueRate: number; carryRate: number; neutralRate: number };
  headline: string;
  note?: string;
  games: TeamGameRow[];
};

export type InsightsResponse = {
  all: InsightAll;
  team: TeamIndicators;
};