// backend/services/reports/reports.repo.js
// 통계에 필요한 최소 필드만 가져오기
const Game = require("../../models/Game");

function buildDateRange(from, to){
  if (!from && !to) return null;

  const range = {};
  if (from) range.$gte = from;
  if (to) range.$lte = to;
  return range;
}

function buildSort(sort = 'desc') {
  // 안정적 정렬: 같은 gameDate일 때 _id로 tie-break
  if (sort === 'asc') return { gameDate: 1, _id: 1 };
  return { gameDate: -1, _id: -1 };
}

/**
 *   통계/리포트용 게임 목록 fetch
 * - from/to는 Date 객체라고 가정(라우트/validator에서 파싱)
 * - fields는 mongoose select string
 */

function fetchGamesByUser(userId, opts = {}) {
  const {
    from,
    to,
    limit,           // undefined면 제한 없음
    sort = 'desc',
    fields = 'score inning result gameType gameDate', // 최소 필드
  } = opts;

  const q = { userId };
  const range = buildDateRange(from, to);
  if (range) q.gameDate = range;

  const query = Game.find(q)
    .select(fields)
    .sort(buildSort(sort));

  if (limit !== undefined && limit !== null) {
    query.limit(Number(limit));
  }

  return query.lean();
}

/**
 *  단건 게임 fetch (evaluation 용)
 */
function fetchGameByIdAndUser(gameId, userId, opts = {}) {
  const {
    fields = 'score inning result gameType gameDate memo',
  } = opts;

  return Game.findOne({ _id: gameId, userId })
    .select(fields)
    .lean();
}

/**
 * ✅ 리포트에서 total count가 필요하면 사용(선택)
 */
function countGamesByUser(userId, opts = {}) {
  const { from, to } = opts;

  const q = { userId };
  const range = buildDateRange(from, to);
  if (range) q.gameDate = range;

  return Game.countDocuments(q);
}

module.exports = {
  fetchGamesByUser,
  fetchGameByIdAndUser,
  countGamesByUser,
};