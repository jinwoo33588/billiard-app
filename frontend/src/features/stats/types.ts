// src/features/stats/types.ts

export type StatsSelector =
  | { type: "all" }
  | { type: "lastN"; n: number }
  | { type: "range"; from?: string; to?: string }
  | { type: "thisMonth"; now?: string }
  | { type: "yearMonth"; year: number; month: number };

export type FullStats = {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  totalScore: number;
  totalInnings: number;
  winRate: number; // 0~100
  average: number; // totalScore/totalInnings
  volatility: number;
  bestAverage: number;
  bestScore: number;
};

export type BuildStatsResponse = {
  selector: StatsSelector;
  sampleN: number;
  updatedAt: string;
  stats: FullStats; // ✅ flat
};

export type MonthlyRow = {
  monthKey: string; // "2025-10"
  label: string; // "2025.10"
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number | null; // 0~100
  average: number | null; // totalScore/totalInnings
};

export type MonthlyStatsResponse = {
  selector: StatsSelector;
  updatedAt: string;
  rows: MonthlyRow[];
};