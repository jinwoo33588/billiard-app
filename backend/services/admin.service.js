const mongoose = require("mongoose");
const User = require("../models/User");
const Game = require("../models/Game");
const { buildDateRange } = require("../utils/date");
const gamesService = require("./games.service");
const usersService = require("./users.service");
const insightsService = require("./insights/insights.service");

function safeDiv(a, b) {
  return b > 0 ? a / b : 0;
}

async function getOverview() {
  const totalUsers = await User.countDocuments();
  const totalGames = await Game.countDocuments();

  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const gamesThisMonth = await Game.countDocuments({ gameDate: { $gte: from, $lte: to } });
  const activeUsersThisMonth = await Game.distinct("userId", { gameDate: { $gte: from, $lte: to } });

  return {
    totalUsers,
    totalGames,
    gamesThisMonth,
    activeUsersThisMonth: activeUsersThisMonth.length,
  };
}

function summarizeGames(games) {
  const base = {
    gamesCount: 0,
    wins: 0,
    draws: 0,
    loses: 0,
    scoreSum: 0,
    inningSum: 0,
    bestScore: 0,
    bestAvg: 0,
    lastGameDate: null,
  };

  if (!games || !games.length) return base;

  for (const g of games) {
    base.gamesCount += 1;
    if (g.result === "WIN") base.wins += 1;
    if (g.result === "DRAW") base.draws += 1;
    if (g.result === "LOSE") base.loses += 1;

    base.scoreSum += Number(g.score || 0);
    base.inningSum += Number(g.inning || 0);
    base.bestScore = Math.max(base.bestScore, Number(g.score || 0));

    const avg = g.inning > 0 ? g.score / g.inning : 0;
    base.bestAvg = Math.max(base.bestAvg, avg);

    if (!base.lastGameDate || new Date(g.gameDate) > new Date(base.lastGameDate)) {
      base.lastGameDate = g.gameDate;
    }
  }

  return base;
}

function thisMonthRange() {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const to = now;
  return { from, to };
}

async function listUsers({
  limit = 50,
  q = "",
  includeGames = false,
  gameLimit = 5,
  mode = "all",
  recentLimit = 10,
} = {}) {
  const find = {};
  if (q) {
    const regex = new RegExp(q, "i");
    find.$or = [{ nickname: regex }, { email: regex }];
  }

  const users = await User.find(find)
    .sort({ createdAt: -1 })
    .limit(Math.min(Number(limit) || 50, 200))
    .select("email nickname handicap createdAt updatedAt")
    .lean();

  if (!users.length) return [];

  const ids = users.map((u) => u._id);

  let rowMap = new Map();

  if (mode === "recent") {
    const limitN = Math.max(1, Math.min(Number(recentLimit) || 10, 50));
    const rows = await Promise.all(
      users.map(async (u) => {
        const games = await Game.find({ userId: u._id })
          .sort({ gameDate: -1, updatedAt: -1 })
          .limit(limitN)
          .lean();
        return { _id: u._id, ...summarizeGames(games) };
      })
    );
    rowMap = new Map(rows.map((r) => [String(r._id), r]));
  } else {
    const match = { userId: { $in: ids } };
    if (mode === "month") {
      const range = thisMonthRange();
      match.gameDate = { $gte: range.from, $lte: range.to };
    }

    const rows = await Game.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$userId",
          gamesCount: { $sum: 1 },
          wins: { $sum: { $cond: [{ $eq: ["$result", "WIN"] }, 1, 0] } },
          draws: { $sum: { $cond: [{ $eq: ["$result", "DRAW"] }, 1, 0] } },
          loses: { $sum: { $cond: [{ $eq: ["$result", "LOSE"] }, 1, 0] } },
          scoreSum: { $sum: "$score" },
          inningSum: { $sum: "$inning" },
          lastGameDate: { $max: "$gameDate" },
          bestScore: { $max: "$score" },
          bestAvg: {
            $max: {
              $cond: [{ $gt: ["$inning", 0] }, { $divide: ["$score", "$inning"] }, 0],
            },
          },
        },
      },
    ]);

    rowMap = new Map(rows.map((r) => [String(r._id), r]));
  }

  const summaries = users.map((u) => {
    const row = rowMap.get(String(u._id)) || summarizeGames([]);

    const winLose = row.wins + row.loses;
    const winRate = safeDiv(row.wins, winLose);
    const avg = safeDiv(row.scoreSum, row.inningSum);

    return {
      id: String(u._id),
      email: u.email,
      nickname: u.nickname,
      handicap: u.handicap,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,

      gamesCount: row.gamesCount,
      wins: row.wins,
      draws: row.draws,
      loses: row.loses,
      winRate,
      avg,
      bestScore: row.bestScore,
      bestAvg: row.bestAvg,
      lastGameDate: row.lastGameDate,
    };
  });

  if (!includeGames) return summaries;

  const limitN = Math.max(1, Math.min(Number(gameLimit) || 5, 50));
  const withGames = await Promise.all(
    summaries.map(async (u) => {
      const docs = await gamesService.listMyGames(u.id, { limit: limitN });
      const recentGames = docs.map((d) => d.toPublic());
      return { ...u, recentGames };
    })
  );

  return withGames;
}

async function listUserGames(userId, { limit, from, to } = {}) {
  if (!mongoose.isValidObjectId(userId)) {
    const err = new Error("invalid user id");
    err.status = 400;
    throw err;
  }

  const range = buildDateRange(from, to);
  const opt = { limit: Number(limit) || 50 };
  if (range) {
    opt.from = from;
    opt.to = to;
  }

  const docs = await gamesService.listMyGames(userId, opt);
  return docs.map((d) => d.toPublic());
}

module.exports = {
  getOverview,
  listUsers,
  listUserGames,
  async getUserDashboard(userId, { recent = 10, insightsLimit = 20 } = {}) {
    const uid = mongoose.isValidObjectId(userId) ? new mongoose.Types.ObjectId(userId) : userId;
    const base = await usersService.getUserDashboard(uid, { recent });
    const insights = await insightsService.getMyInsights(uid, { mode: "limit", limit: insightsLimit });
    return { ...base, insights };
  },
};
