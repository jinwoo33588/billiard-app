// backend/services/stats/stats.service.js
const Game = require('../../models/Game');

const { calcStats } = require('./stats.calc');
const { applyPick } = require('./stats.pick');
const selectors = require('./stats.selectors');

/**
 * ✅ games는 통계 계산에 필요한 최소 필드만 가져오면 됨
 * - score, inning, result, gameDate 만 있으면 calcStats 가능
 */
async function fetchMyGamesForStats(userId) {
  return await Game.find({ userId })
    .sort({ gameDate: -1 })
    .select('score inning result gameDate gameType'); // gameType은 나중에 확장 대비
}

/**
 * ✅ 조립기: (DB) -> (selector) -> (calc) -> (pick)
 *
 * options 예시:
 * {
 *   selector: { type: 'lastN', n: 20 },
 *   pick: ['counts','avg','winRate']
 * }
 *
 * selector.type:
 * - 'all'
 * - 'lastN'
 * - 'range'
 * - 'thisMonth'
 * - 'yearMonth'
 */
async function buildStatsForUser(userId, options = {}) {
  const games = await fetchMyGamesForStats(userId);

  // 1) 구간 선택
  const sel = options.selector || { type: 'all' };
  let slice = [];

  switch (sel.type) {
    case 'lastN':
      slice = selectors.selectLastN(games, sel.n);
      break;
    case 'range':
      slice = selectors.selectByRange(games, { from: sel.from, to: sel.to });
      break;
    case 'thisMonth':
      slice = selectors.selectThisMonth(games, sel.now ? new Date(sel.now) : new Date());
      break;
    case 'yearMonth':
      slice = selectors.selectYearMonth(games, { year: sel.year, month: sel.month });
      break;
    case 'all':
    default:
      slice = selectors.selectAll(games);
      break;
  }

  // 2) 계산 (항상 FULL)
  const full = calcStats(slice);

  // 3) pick (필요한 묶음만 잘라서)
  const picked = applyPick(full, options.pick);

  return {
    selector: sel,
    sampleN: slice.length,
    updatedAt: new Date().toISOString(),
    stats: picked,
  };
}

module.exports = {
  buildStatsForUser,
  fetchMyGamesForStats,
};