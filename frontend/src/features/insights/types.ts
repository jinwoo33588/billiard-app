// frontend/src/features/insights/types.ts
export type WindowMode = "all" | "range" | "limit";

export type WindowSpec = {
  mode: WindowMode;
  range: { from: string | null; to: string | null };
  limit: number | null;
};

export type StatsSummary = {
  mode: WindowMode;
  range: { from: string | null; to: string | null };
  limit: number | null;

  gamesCount: number;
  wins: number;
  draws: number;
  loses: number;

  winRate: number; // 너는 winrate 계속 쓴다고 했으니 이거 고정
  expectedWinRate: number; // 팀 구성 기반 기대 승률
  avg: number;

  sums: { score: number; inning: number };
  bestAvg: number;
  bestScore: number;
};

export type HandicapBenchmark = {
  expected: number;
  min: number;
  max: number;
  mode: "exact" | "interp" | "clamp";
};

export type HandicapScore = {
  handicap: number;
  benchmark: HandicapBenchmark;

  inputs: { avg: number; winRate: number };

  scores: { total: number; avgScore: number; winScore: number };

  deltas: { avgDelta: number; avgRatio: number };

  verdict: { band: string; delta: number; text: string };
};

export type InsightsResponse = {
  window: WindowSpec;
  stats: StatsSummary;
  handicapScore: HandicapScore | null;
  note?: string;
};
