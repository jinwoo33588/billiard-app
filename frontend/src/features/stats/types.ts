// frontend/src/features/stats/types.ts

/**
 * StatsSummary
 * - 백엔드 GET /api/me/stats 응답을 그대로 타입으로 정의
 * - 포맷(소수점/퍼센트)은 프론트에서 처리한다 (숫자는 number 그대로 유지)
 */

export type StatsMode = "range" | "limit" | "all";

export type StatsRange = {
  from: string | null; // "YYYY-MM-DD" 또는 null
  to: string | null;   // "YYYY-MM-DD" 또는 null
};

export type StatsSums = {
  score: number;
  inning: number;
};

export type StatsSummary = {
  mode: StatsMode;
  range: StatsRange;
  limit: number | null;

  gamesCount: number;
  wins: number;
  draws: number;
  loses: number;

  winRate: number; // 0~1
  expectedWinRate: number; // 0~1 (팀 구성 기반 기대 승률)
  avg: number;           // scoreSum / inningSum

  sums: StatsSums;

  bestAvg: number;
  bestScore: number;
};
