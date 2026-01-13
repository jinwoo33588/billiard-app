// backend/services/stats/stats.read.js
const Game = require("../../models/Game");

const UserStats = require("../../models/UserStats");
const UserDailyStats = require("../../models/UserDailyStats");
const UserMonthlyStats = require("../../models/UserMonthlyStats");

const { dayStart, monthKeyOf } = require("./stats.keys");
const { emptyCore, deriveStats, mergeCore } = require("./stats.core");
const { ensureStatsReady } = require("./stats.rebuild");


async function getAllStats(userId, debug = false) {
  const ok = await ensureStatsReady(userId);

  const doc = await UserStats.findOne({ userId }).select("core rebuildLock");

  const res = {
    updatedAt: doc?.core?.updatedAt ?? null,
    stats: doc?.core ? deriveStats(doc.core) : deriveStats(emptyCore()),
    needsRebuild: doc?.core?.needsRebuild ?? { best: false },
  };

  if (debug) {
    const gamesN = await Game.countDocuments({ userId });
    res.__debug = {
      ensure: ok,                 // {ready, rebuilt} 같은 값
      hasUserStats: !!doc,
      rebuildLock: doc?.rebuildLock ?? null,
      gamesCount: gamesN,
      userIdType: typeof userId,
      userIdValue: String(userId),
    };
  }

  return res;
}


async function getRangeStats(userId, from, to) {
  const ok = await ensureStatsReady(userId);

  const f = new Date(from);
  const t = new Date(to);
  if (Number.isNaN(f.getTime()) || Number.isNaN(t.getTime())) {
    return { stats: deriveStats(emptyCore()), sampleDays: 0, updatedAt: new Date().toISOString() };
  }

  t.setHours(23, 59, 59, 999);

  const days = await UserDailyStats.find({
    userId,
    date: { $gte: dayStart(f), $lte: dayStart(t) },
  }).sort({ date: 1 });

  const merged = days.reduce((acc, d) => mergeCore(acc, d.core), emptyCore());

  return { stats: deriveStats(merged), sampleDays: days.length, updatedAt: new Date().toISOString() };
}

async function getMonthlySeries(userId, fromMonthKey, toMonthKey) {
  const ok = await ensureStatsReady(userId);
  
  const q = { userId };
  if (fromMonthKey || toMonthKey) {
    q.monthKey = {};
    if (fromMonthKey) q.monthKey.$gte = fromMonthKey;
    if (toMonthKey) q.monthKey.$lte = toMonthKey;
  }

  const docs = await UserMonthlyStats.find(q).sort({ year: 1, month: 1 });

  const rows = docs.map((d) => {
    const s = deriveStats(d.core);
    return {
      monthKey: d.monthKey,
      label: d.monthKey.replace("-", "."),
      games: s.totalGames,
      wins: s.wins,
      draws: s.draws,
      losses: s.losses,
      winRate: s.totalGames ? s.winRate : null,
      average: s.totalGames ? s.average : null,
    };
  });

  return { rows, updatedAt: new Date().toISOString() };
}

async function getYearMonthStats(userId, year, month) {
  const ok = await ensureStatsReady(userId);

  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    return { stats: deriveStats(emptyCore()), monthKey: null, updatedAt: new Date().toISOString() };
  }

  const monthKey = `${y}-${String(m).padStart(2, "0")}`;
  const doc = await UserMonthlyStats.findOne({ userId, monthKey });
  const core = doc?.core ?? emptyCore();

  return { monthKey, stats: deriveStats(core), updatedAt: new Date().toISOString() };
}

async function getThisMonthStats(userId, now = new Date()) {
  const ok = await ensureStatsReady(userId);

  const monthKey = monthKeyOf(now);
  const doc = await UserMonthlyStats.findOne({ userId, monthKey });
  const core = doc?.core ?? emptyCore();
  return { monthKey, stats: deriveStats(core), updatedAt: new Date().toISOString() };
}

// lastN 계산 전용(원본 조회 허용)
async function getLastNStats(userId, n) {
  const ok = await ensureStatsReady(userId);

  const k = Math.max(1, Math.min(Number(n) || 10, 2000)); // 상한은 너가 정해도 됨

  const games = await Game.find({ userId })
    .sort({ gameDate: -1 })
    .limit(k)
    .select("score inning result gameDate"); // 통계에 필요한 최소 필드만

  // 스냅샷 -> core 누적
  const core = emptyCore();
  for (const g of games) {
    const score = Number(g.score || 0);
    const inning = Number(g.inning || 1);
    const result = String(g.result || "UNKNOWN");

    core.counts.totalGames += 1;
    if (result === "WIN") core.counts.wins += 1;
    else if (result === "DRAW") core.counts.draws += 1;
    else if (result === "LOSE") core.counts.losses += 1;

    core.totals.totalScore += score;
    core.totals.totalInnings += inning;

    const avg = score / inning;
    core.moments.sumAvg += avg;
    core.moments.sumSqAvg += avg * avg;

    core.best.bestScore = Math.max(core.best.bestScore, score);
    core.best.bestAverage = Math.max(core.best.bestAverage, avg);
  }

  return {
    selector: { type: "lastN", n: k },
    sampleN: games.length,
    updatedAt: new Date().toISOString(),
    stats: deriveStats(core),
  };
}

module.exports = { getAllStats, getRangeStats, getMonthlySeries, getYearMonthStats, getThisMonthStats, getLastNStats };