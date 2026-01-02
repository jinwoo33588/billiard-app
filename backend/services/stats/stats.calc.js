// backend/services/stats/stats.calc.js
const { EMPTY } = require('./stats.types');

function num(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function round(n, d) {
  const x = num(n, 0);
  const p = 10 ** d;
  return Math.round(x * p) / p;
}

/**
 * ✅ games[] -> FULL stats
 * - result: WIN/DRAW/LOSE/UNKNOWN
 * - average: totalScore/totalInnings
 * - winRate: wins/(wins+losses) * 100  (DRAW/UNKNOWN 제외)
 * - volatility: stddev(score/inning)
 * - bestAverage: max(score/inning)
 * - bestScore: max(score)
 */
function calcStats(games) {
  if (!Array.isArray(games) || games.length === 0) return { ...EMPTY };

  const totalGames = games.length;

  let wins = 0;
  let draws = 0;
  let losses = 0;

  // inning > 0인 것만 평균/표준편차에 사용
  const valid = [];
  for (const g of games) {
    const r = String(g.result || 'UNKNOWN');
    if (r === 'WIN') wins += 1;
    else if (r === 'DRAW') draws += 1;
    else if (r === 'LOSE') losses += 1;

    if (num(g.inning, 0) > 0) valid.push(g);
  }

  let totalScore = 0;
  let totalInnings = 0;

  let bestAverage = 0;
  let bestScore = 0;

  for (const g of valid) {
    const s = num(g.score, 0);
    const inn = num(g.inning, 0);

    totalScore += s;
    totalInnings += inn;

    const avg = inn > 0 ? s / inn : 0;
    if (avg > bestAverage) bestAverage = avg;
  }

  for (const g of games) {
    const s = num(g.score, 0);
    if (s > bestScore) bestScore = s;
  }

  const average = totalInnings > 0 ? totalScore / totalInnings : 0;

  const denom = wins + losses; // DRAW/UNKNOWN 제외
  const winRate = denom > 0 ? (wins / denom) * 100 : 0;

  // volatility = stddev(score/inning)
  const avgs = valid.map((g) => {
    const inn = num(g.inning, 0);
    const s = num(g.score, 0);
    return inn > 0 ? s / inn : 0;
  });

  const mean = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0;
  const variance = avgs.length
    ? avgs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / avgs.length
    : 0;
  const volatility = Math.sqrt(variance);

  return {
    totalGames,
    wins,
    draws,
    losses,
    totalScore: round(totalScore, 0),
    totalInnings: round(totalInnings, 0),
    winRate: round(winRate, 1),
    average: round(average, 3),
    volatility: round(volatility, 3),
    bestAverage: round(bestAverage, 3),
    bestScore: round(bestScore, 0),
  };
}

module.exports = { calcStats, round, num };