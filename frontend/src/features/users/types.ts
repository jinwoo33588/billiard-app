// frontend/src/features/users/types.ts

export type StatsMode = "all" | "limit" | "range";

export type StatsSummary = {
  mode: StatsMode;
  range: { from: string | null; to: string | null };
  limit: number | null;

  gamesCount: number;
  wins: number;
  draws: number;
  loses: number;

  // 백엔드가 winRate로 주는 걸 기준으로
  winRate: number;
  expectedWinRate: number;

  avg: number;

  sums: {
    score: number;
    inning: number;
  };

  bestAvg: number;
  bestScore: number;
};

export type UserPublic = {
  id: string;
  nickname: string;
  handicap: number;
};

export type UserDashboardResponse = {
  user: UserPublic;
  stats: {
    all: StatsSummary;
    thisMonth: StatsSummary;
    recent: StatsSummary;
  };
  recentGames: any[]; // ✅ Game 타입을 쓰고 싶으면 아래에서 Game import해서 교체
};