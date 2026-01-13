// backend/services/insights/insights.service.js
const User = require("../../models/User");
const statsRead = require("../stats/stats.read");
const { getBenchmark } = require("../../constants/handicapBenchmarks");
const { buildFormAll } = require("./insights.form");
const { fetchTeamGamesLastN, buildTeamInsights } = require("./insights.team");

function clampWindow(n) {
  const k = Number(n);
  if (!Number.isFinite(k)) return 60;
  return Math.max(5, Math.min(k, 2000));
}

async function getUserHandicap(userId) {
  const u = await User.findById(userId).select("handicap");
  return u?.handicap ?? 0;
}

/**
 * GET /me/insights?window=60
 * - all: statsRead.getLastNStats() (원본 조회 허용)
 * - team: 팀전만 조회 + 판별(gps) 허용
 */
async function getInsightsForUser(userId, windowSize = 60) {
  const windowN = clampWindow(windowSize);

  // 1) benchmark
  const handicap = await getUserHandicap(userId);
  const benchmark = getBenchmark(handicap);

  // 2) recent stats (lastN) - 폼 계산의 핵심 재료
  const recentStats = await statsRead.getLastNStats(userId, windowN);

  // 3) all(form) result
  const all = buildFormAll({
    benchmark: {
      handicap: benchmark.handicap,
      expected: benchmark.expected,
      min: benchmark.min,
      max: benchmark.max,
    },
    recentStats,
    minGames: 5,
  });

  // 4) team (NEW)
  const teamGames = await fetchTeamGamesLastN(userId, windowN);
  const team = buildTeamInsights({
    games: teamGames,
    benchmark: {
      handicap: benchmark.handicap, // ✅ vol 기준점(목표점수)
      expected: benchmark.expected, // ✅ eff 기준점(기대 에버)
    },
    opts: {
      minInning: 1,      // 필요하면 10~20 추천
      decidedOnly: true, // WIN/LOSE만 포함
    },
  });

  return {
    window: windowN,
    all,
    team,
    updatedAt: new Date().toISOString(),
  };
}

module.exports = { getInsightsForUser };