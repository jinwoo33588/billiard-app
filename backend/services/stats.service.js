/**
 * services/stats.service.js
 * - Game 컬렉션을 기반으로 유저 통계(기간/최근N/전체)를 집계한다.
 * - 반환은 "요약 수치"만 포함하며, 원본 게임 리스트는 내려주지 않는다.
 */

const Game = require("../models/Game");
const httpError = require("../utils/httpError");
const { buildDateRange } = require("../utils/date");

function safeDiv(a, b) {
  return b > 0 ? a / b : 0;
}

function normalizeResult(row, meta) {
  const base = row || {
    gamesCount: 0,
    wins: 0,
    draws: 0,
    loses: 0,
    scoreSum: 0,
    inningSum: 0,
    bestAvg: 0,
    bestScore: 0,
  };

  const winLoseTotal = base.wins + base.loses; // ✅ 무 제외
  const winRate = safeDiv(base.wins, winLoseTotal);
  const avg = safeDiv(base.scoreSum, base.inningSum);

  return {
    ...meta, // { mode, range, limit }
    gamesCount: base.gamesCount,
    wins: base.wins,
    draws: base.draws,
    loses: base.loses,

    winRate,
    avg,

    sums: {
      score: base.scoreSum,
      inning: base.inningSum,
    },

    bestAvg: base.bestAvg || 0,
    bestScore: base.bestScore || 0,
  };
}

/**
 * 공통 집계 파이프라인:
 * - gamesCount, wins/draws/loses, scoreSum, inningSum
 * - bestScore, bestAvg
 */
function buildGroupPipeline(match) {
  return [
    { $match: match },
    {
      $group: {
        _id: null,
        gamesCount: { $sum: 1 },

        wins: { $sum: { $cond: [{ $eq: ["$result", "WIN"] }, 1, 0] } },
        draws: { $sum: { $cond: [{ $eq: ["$result", "DRAW"] }, 1, 0] } },
        loses: { $sum: { $cond: [{ $eq: ["$result", "LOSE"] }, 1, 0] } },

        scoreSum: { $sum: "$score" },
        inningSum: { $sum: "$inning" },

        bestScore: { $max: "$score" },

        bestAvg: {
          $max: {
            $cond: [
              { $gt: ["$inning", 0] },
              { $divide: ["$score", "$inning"] },
              0,
            ],
          },
        },
      },
    },
  ];
}

/**
 * ✅ 핵심 함수: 내 통계 조회
 * @param {ObjectId} userId  // ✅ auth middleware에서 ObjectId로 표준화됨
 * @param {{ mode: 'range'|'limit'|'all', range?:{from,to}, limit?:number }} opt
 */
async function getMyStats(userId, opt) {
  const mode = opt?.mode || "all";
  const range = opt?.range || { from: null, to: null };
  const limit = opt?.limit ?? null;

  // 1) range
  if (mode === "range") {
    const dateRange = buildDateRange(range.from, range.to);
    if (!dateRange) throw httpError(400, "invalid date range");

    const match = { userId, gameDate: dateRange };
    const [row] = await Game.aggregate(buildGroupPipeline(match));

    return normalizeResult(row, { mode, range, limit: null });
  }

  // 2) limit (recent N)
  if (mode === "limit") {
    if (!limit || limit <= 0) throw httpError(400, "limit is required");

    // ✅ 최신 N개의 _id 확보 (내 게임만)
    const recent = await Game.find({ userId })
      .sort({ gameDate: -1, updatedAt: -1 })
      .select("_id")
      .limit(limit);

    const ids = recent.map((d) => d._id);
    if (ids.length === 0) {
      return normalizeResult(null, { mode, range: { from: null, to: null }, limit });
    }

    // ✅ 해당 id들만 집계
    const match = { userId, _id: { $in: ids } };
    const [row] = await Game.aggregate(buildGroupPipeline(match));

    return normalizeResult(row, { mode, range: { from: null, to: null }, limit });
  }

  // 3) all
  {
    const match = { userId };
    const [row] = await Game.aggregate(buildGroupPipeline(match));
    return normalizeResult(row, { mode: "all", range: { from: null, to: null }, limit: null });
  }
}

module.exports = {
  getMyStats,
};