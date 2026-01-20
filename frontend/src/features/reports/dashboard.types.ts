export type GameResult = "WIN" | "DRAW" | "LOSE" | "UNKNOWN";

export interface SummaryStats {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;
  totalScore: number;
  totalInnings: number;
  average: number;
  winRate: number;
  volatility: number;
  bestScore: number;
  bestAverage: number;
}

export interface MonthRow extends SummaryStats {
  monthKey: string; // "YYYY-MM"
  label: string;    // "YYYY.MM"
}

export interface GpsSummary {
  gps: number;
  effScore: number;
  volScore: number;
  weights: { eff: number; vol: number; k: number };
}

export interface RecentGame {
  _id: string;
  gameDate: string;  // ISO string
  gameType: string;
  score: number;
  inning: number;
  result: GameResult;
  memo: string;
  gps?: number;
}

export interface DashboardReport {
  recent: SummaryStats & { window: number };
  thisMonth: SummaryStats & { range: { from: string | null; to: string | null } };
  recentGames?: RecentGame[];
}

export interface DashboardQuery {
  recent?: number;
  months?: number;
  includeRecentGames?: boolean;
  includeGps?: boolean;
}