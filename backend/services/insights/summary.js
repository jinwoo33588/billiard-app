// backend/services/insights/summary.js

const { round } = require('./math');

/**
 * 게임 배열 요약 통계.
 *
 * 계산:
 * - recentAvg = 총점 / 총이닝
 * - winRate = 승 / (승+패) * 100   (DRAW/UNKNOWN 제외)
 * - volatility = 에버리지들의 표준편차
 *   에버리지 = score / inning
 */
function summarize(games) {
  const valid = games.filter((g) => (Number(g.inning) || 0) > 0);

  const totalGames = games.length;
  const wins = games.filter((g) => g.result === 'WIN').length;
  const draws = games.filter((g) => g.result === 'DRAW').length;
  const losses = games.filter((g) => g.result === 'LOSE').length;

  const totalScore = valid.reduce((acc, g) => acc + (Number(g.score) || 0), 0);
  const totalInnings = valid.reduce((acc, g) => acc + (Number(g.inning) || 0), 0);

  // ✅ 평균 에버리지(최근 평균) = 총점/총이닝
  const recentAvg = totalInnings > 0 ? totalScore / totalInnings : 0;

  // ✅ 무/UNKNOWN 제외 승률
  const denom = wins + losses;
  const winRate = denom > 0 ? (wins / denom) * 100 : 0;

  // ✅ 표준편차(기복) = sqrt( Σ(x-mean)^2 / N )
  const avgs = valid.map((g) => (Number(g.inning) > 0 ? Number(g.score) / Number(g.inning) : 0));
  const mean = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : 0;
  const variance = avgs.length ? avgs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / avgs.length : 0;
  const volatility = Math.sqrt(variance);

  return {
    totalGames,
    wins,
    draws,
    losses,
    recentAvg: round(recentAvg, 3),
    winRate: round(winRate, 1),
    volatility: round(volatility, 3),
  };
}

/**
 * 단일 경기 에버리지 (score/inning)
 * inning이 0이면 null (안전)
 */
function safeAvg(game) {
  const inning = Number(game.inning) || 0;
  const score = Number(game.score) || 0;
  if (inning <= 0) return null;
  return score / inning;
}

module.exports = { summarize, safeAvg };