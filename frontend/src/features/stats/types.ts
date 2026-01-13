export type StatsType = "all" | "range" | "thisMonth" | "yearMonth" | "lastN";

export type Stats = {
  totalGames: number;
  wins: number;
  draws: number;
  losses: number;

  totalScore: number;
  totalInnings: number;

  winRate: number;      // 0~100
  average: number;      // score/inning
  volatility: number;   // stddev(avg)

  bestAverage: number;
  bestScore: number;
};

export type StatsSelector =
  | { type: "all" }
  | { type: "range"; from: string; to: string } // YYYY-MM-DD or ISO
  | { type: "thisMonth"; now?: string }         // optional ISO
  | { type: "yearMonth"; year: number; month: number } // month: 1~12
  | { type: "lastN"; n: number };

export type StatsResponse = {
  selector: StatsSelector;
  updatedAt: string; // ISO
  stats: Stats;

  // optional fields from backend (있으면 받음)
  sampleN?: number;
  sampleDays?: number;
  monthKey?: string;
};

export type MonthlyRow = {
  monthKey: string; // "YYYY-MM"
  label: string;    // "YYYY.MM"
  games: number;
  wins: number;
  draws: number;
  losses: number;
  winRate: number | null;
  average: number | null;
};

export type MonthlySeriesResponse = {
  selector: { type: "monthly" } | { type: string };
  updatedAt: string;
  rows: MonthlyRow[];
};