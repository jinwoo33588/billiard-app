// backend/services/stats/stats.types.js

const EMPTY = Object.freeze({
  totalGames: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  totalScore: 0,
  totalInnings: 0,
  winRate: 0,       // 0~100 (wins/(wins+losses))
  average: 0,       // totalScore/totalInnings
  volatility: 0,    // stddev(score/inning)
  bestAverage: 0,   // max(score/inning)
  bestScore: 0,     // max(score)
});

const PICK = Object.freeze({
  COUNTS: 'counts',
  TOTALS: 'totals',
  AVG: 'avg',
  WINRATE: 'winRate',
  VOLATILITY: 'volatility',
  BESTS: 'bests',
});

module.exports = { EMPTY, PICK };