export type AdminOverview = {
  totalUsers: number;
  totalGames: number;
  gamesThisMonth: number;
  activeUsersThisMonth: number;
};

export type AdminUserSummary = {
  id: string;
  email: string;
  nickname: string;
  handicap: number;
  createdAt?: string;
  updatedAt?: string;

  gamesCount: number;
  wins: number;
  draws: number;
  loses: number;
  winRate: number;
  avg: number;
  bestScore: number;
  bestAvg: number;
  lastGameDate?: string | null;
};

export type AdminUserWithGames = AdminUserSummary & {
  recentGames?: import("../games/types").Game[];
};

export type AdminUserDashboard = {
  user: {
    id: string;
    nickname: string;
    handicap: number;
  };
  stats: {
    all: import("../stats/types").StatsSummary;
    thisMonth: import("../stats/types").StatsSummary;
    recent: import("../stats/types").StatsSummary;
  };
  recentGames: import("../games/types").Game[];
  insights: import("../insights/types").InsightsResponse;
};
