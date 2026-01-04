// src/api/endpoints.ts
export const EP = {
  auth: {
    login: "/auth/login",
    register: "/auth/register",
  },
  me: {
    root: "/me",
    games: "/me/games",
    insights: "/me/insights",
    stats: "/me/stats",
    statsMonthly: "/me/stats/monthly",
  },
  users: {
    profile: (userId: string) => `/users/${userId}`,
  },
  rankings: "/rankings",
} as const;