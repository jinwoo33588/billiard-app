// backend/services/stats/stats.pick.js
const { EMPTY, PICK } = require('./stats.types');

const PICK_MAP = Object.freeze({
  [PICK.COUNTS]: ['totalGames', 'wins', 'draws', 'losses'],
  [PICK.TOTALS]: ['totalScore', 'totalInnings'],
  [PICK.AVG]: ['average'],
  [PICK.WINRATE]: ['winRate'],
  [PICK.VOLATILITY]: ['volatility'],
  [PICK.BESTS]: ['bestAverage', 'bestScore'],
});

/**
 * picks: ['counts','avg'] 처럼 들어오면 해당 필드만 반환
 * - picks 없으면 full 반환
 */
function applyPick(stats, picks) {
  if (!picks) return stats;
  const arr = Array.isArray(picks) ? picks : String(picks).split(',').map((s) => s.trim()).filter(Boolean);
  if (arr.length === 0) return stats;

  const out = {};
  for (const p of arr) {
    const fields = PICK_MAP[p] || [];
    for (const f of fields) {
      out[f] = f in stats ? stats[f] : EMPTY[f];
    }
  }
  return out;
}

module.exports = { PICK_MAP, applyPick };