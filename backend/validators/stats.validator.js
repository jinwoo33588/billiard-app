/**
 * validators/me.validator.js
 * - me 관련 입력 검증/정규화 함수들 모음
 * - 이번에 추가: validateStatsQuery(query)
 */

const httpError = require("../utils/httpError");
const { isYmd } = require("../utils/date");
const { parseLimit } = require("../utils/parse");

/**
 * ✅ /api/me/stats?from&to&limit 쿼리 검증
 *
 * 규칙:
 * - from/to가 하나라도 있으면 mode="range"
 * - from/to 없고 limit만 있으면 mode="limit"
 * - 셋 다 없으면 mode="all"
 * - limit는 1~200
 * - 날짜는 YYYY-MM-DD
 */

function validateStatsQuery(query){
  const {from, to, limit} = query;
  if (from && !isYmd(from)) throw httpError(400, "invalid from (YYYY-MM-DD)");
  if (to && !isYmd(to)) throw httpError(400, "invalid to (YYYY-MM-DD)");

  const lim = parseLimit(limit, { min: 1, max: 200 });
  if (limit !== undefined && lim === null) {
    throw httpError(400, "invalid limit (1~200)");
  }

  const hasRange = Boolean(from || to);

  // ✅ 정책: range가 있으면 range 우선, limit은 무시(혼란 방지)
  // (원하면 여기서 "둘 다 주면 400"으로 바꿔도 됨)
  const mode = hasRange ? "range" : lim ? "limit" : "all";

  return {
    mode, // "range" | "limit" | "all"
    range: { from: from || null, to: to || null },
    limit: mode === "limit" ? lim : null,
  };
}

module.exports = {
  validateStatsQuery,
};