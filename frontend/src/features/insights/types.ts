// frontend/src/features/insights/types.ts

export type Benchmark = {
  handicap: number;
  expected: number;
  min?: number;
  max?: number;
};

export type FormStats = {
  recentAvg: number;
  delta: number;
  winRate: number;
  volatility: number;
  sampleN: number;
};

export type InsightAll = {
  benchmark: Benchmark;
  stats: FormStats | null;
  reasons?: string[];
};

export type GpsWeights = {
  eff: number;
  vol: number;
  k: number;
};

export type TeamGameRow = {
  gameId: string;
  date: string | null;
  gameType: string;
  result: string;

  score: number;
  inning: number;

  avg: number;
  eff: number;
  vol: number;

  effScore: number;
  volScore: number;
  gps: number;

  weights: GpsWeights;
};

export type TeamMeta = {
  minInning: number;
  decidedOnly: boolean;
  excluded: number;
};

export type TeamInsights = {
  sampleN: number;
  benchmark: { handicap: number; expected: number };
  meta: TeamMeta;
  games: TeamGameRow[];
  note?: string;
  // summary?: any  // 지금은 주석 처리한 상태라 없음
};

export type InsightsResponse = {
  window: number;
  all: InsightAll;
  team: TeamInsights;
  updatedAt: string;
};