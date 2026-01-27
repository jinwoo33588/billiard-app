export type RankingMode = "thisMonth" | "all";
export type RankingMetric = "avg" | "winRate";

export type RankingUser = {
  id: string;
  nickname?: string;
  name?: string;
  handicap?: number;
};

export type RankingStats = {
  gamesCount: number;
  wins: number;
  draws: number;
  loses: number;

  avg: number;        // 0 games면 0으로 내려올 수도 있음
  winRate: number;    // 0 games면 0으로 내려올 수도 있음
};

export type RankingItem = {
  rank: number; // 백엔드에서 내려주면 사용, 없으면 프론트에서 index+1로 채움
  user: RankingUser;
  stats: RankingStats;
};

export type RankingResponse = {
  mode: RankingMode;
  metric: RankingMetric;
  limit: number;
  items: RankingItem[];
};