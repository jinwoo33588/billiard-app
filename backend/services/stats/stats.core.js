//backend/services/stats/stats.core.js
const { round } = require("./stats.keys");

function emptyCore() {
  return {
    counts: { totalGames: 0, wins: 0, draws: 0, losses: 0 },
    totals: { totalScore: 0, totalInnings: 0 },
    moments: { sumAvg: 0, sumSqAvg: 0 },
    best: { bestScore: 0, bestAverage: 0 },
    needsRebuild: { best: false },
    updatedAt: new Date(),
  };
}

function getDeltaFromGame(g) {
  const score = Number(g.score || 0);
  const inning = Number(g.inning || 1); // Game schema: min 1
  const result = String(g.result || "UNKNOWN");

  const wins = result === "WIN" ? 1 : 0;
  const draws = result === "DRAW" ? 1 : 0;
  const losses = result === "LOSE" ? 1 : 0;

  const avg = score / inning;

  return {
    counts: { totalGames: 1, wins, draws, losses },
    totals: { totalScore: score, totalInnings: inning },
    moments: { sumAvg: avg, sumSqAvg: avg * avg },
    bestCandidate: { bestScore: score, bestAverage: avg },
  };
}

function applyDelta(core, delta, sign) {
  core.counts.totalGames += sign * delta.counts.totalGames;
  core.counts.wins += sign * delta.counts.wins;
  core.counts.draws += sign * delta.counts.draws;
  core.counts.losses += sign * delta.counts.losses;

  core.totals.totalScore += sign * delta.totals.totalScore;
  core.totals.totalInnings += sign * delta.totals.totalInnings;

  core.moments.sumAvg += sign * delta.moments.sumAvg;
  core.moments.sumSqAvg += sign * delta.moments.sumSqAvg;

  // 바닥 보호
  core.counts.totalGames = Math.max(0, core.counts.totalGames);
  core.counts.wins = Math.max(0, core.counts.wins);
  core.counts.draws = Math.max(0, core.counts.draws);
  core.counts.losses = Math.max(0, core.counts.losses);
  core.totals.totalScore = Math.max(0, core.totals.totalScore);
  core.totals.totalInnings = Math.max(0, core.totals.totalInnings);
  core.moments.sumAvg = Math.max(0, core.moments.sumAvg);
  core.moments.sumSqAvg = Math.max(0, core.moments.sumSqAvg);

  core.updatedAt = new Date();
}

function applyBestOnInsert(core, delta) {
  core.best.bestScore = Math.max(core.best.bestScore || 0, delta.bestCandidate.bestScore);
  core.best.bestAverage = Math.max(core.best.bestAverage || 0, delta.bestCandidate.bestAverage);
}

function markBestDirtyIfNeeded(core, removingGame) {
  const score = Number(removingGame.score || 0);
  const inning = Number(removingGame.inning || 1);
  const avg = score / inning;

  if (score === (core.best.bestScore || 0) || avg === (core.best.bestAverage || 0)) {
    core.needsRebuild.best = true;
  }
}

function deriveStats(core) {
  const wins = core.counts.wins;
  const losses = core.counts.losses;
  const denom = wins + losses;
  const winRate = denom > 0 ? (wins / denom) * 100 : 0;

  const average = core.totals.totalInnings > 0
    ? core.totals.totalScore / core.totals.totalInnings
    : 0;

  // inning >= 1 이므로 모든 게임에 avg 존재
  const n = core.counts.totalGames;
  const mean = n > 0 ? core.moments.sumAvg / n : 0;
  const variance = n > 0 ? (core.moments.sumSqAvg / n) - mean * mean : 0;
  const volatility = variance > 0 ? Math.sqrt(variance) : 0;

  return {
    totalGames: core.counts.totalGames,
    wins,
    draws: core.counts.draws,
    losses,
    totalScore: core.totals.totalScore,
    totalInnings: core.totals.totalInnings,
    average: round(average, 3),
    winRate: round(winRate, 1),
    volatility: round(volatility, 3),
    bestScore: core.best.bestScore || 0,
    bestAverage: round(core.best.bestAverage || 0, 3),
  };
}

function mergeCore(a, b) {
  a.counts.totalGames += b.counts.totalGames;
  a.counts.wins += b.counts.wins;
  a.counts.draws += b.counts.draws;
  a.counts.losses += b.counts.losses;

  a.totals.totalScore += b.totals.totalScore;
  a.totals.totalInnings += b.totals.totalInnings;

  a.moments.sumAvg += b.moments.sumAvg;
  a.moments.sumSqAvg += b.moments.sumSqAvg;

  a.best.bestScore = Math.max(a.best.bestScore || 0, b.best.bestScore || 0);
  a.best.bestAverage = Math.max(a.best.bestAverage || 0, b.best.bestAverage || 0);

  a.needsRebuild.best = a.needsRebuild.best || b.needsRebuild.best;
  a.updatedAt = new Date();
  return a;
}

module.exports = {
  emptyCore,
  getDeltaFromGame,
  applyDelta,
  applyBestOnInsert,
  markBestDirtyIfNeeded,
  deriveStats,
  mergeCore,
};