// src/api/endpoints.ts
export const EP = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  me: {
    root: "/me",
    games: "/me/games",
    game: (gameId: string) => `/me/games/${gameId}`,
    insights: "/me/insights",
    stats: "/me/stats",
    statsMonthly: "/me/stats/monthly",
  },
  users: {
    profile: (userId: string) => `/users/${userId}`,
    games: (userId: string) => `/users/${userId}/games`,
  },
  rankings: "/rankings",
  meta: {
    handicapBenchmarks: "/meta/handicap-benchmarks",
  },
} as const;