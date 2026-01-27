// backend/validators/insights.validator.js
const httpError = require("../utils/httpError");
const { isYmd } = require("../utils/date");
const { parseLimit } = require("../utils/parse");

const MODES = ["limit", "range", "all"];

function validateInsightsQuery(query) {
  const modeRaw = query.mode;
  const mode = modeRaw ? String(modeRaw) : "limit";
  if (!MODES.includes(mode)) throw httpError(400, "invalid mode");

  const limit = parseLimit(query.limit, { min: 1, max: 200 });
  if (query.limit !== undefined && limit === null) {
    throw httpError(400, "invalid limit (1~200)");
  }

  const from = query.from ? String(query.from) : undefined;
  const to = query.to ? String(query.to) : undefined;

  if (from && !isYmd(from)) throw httpError(400, "invalid from (YYYY-MM-DD)");
  if (to && !isYmd(to)) throw httpError(400, "invalid to (YYYY-MM-DD)");

  // 기본값: 최근 20판
  const finalLimit = limit ?? 20;

  // mode별 요구사항 최소 검증
  if (mode === "limit") {
    return { mode, limit: finalLimit, range: { from: null, to: null } };
  }

  if (mode === "range") {
    // range는 from/to 중 하나라도 있어야 의미 있음(정책은 취향)
    if (!from && !to) throw httpError(400, "range mode requires from or to");
    return { mode, limit: null, range: { from: from ?? null, to: to ?? null } };
  }

  // all
  return { mode: "all", limit: null, range: { from: null, to: null } };
}

module.exports = {
  validateInsightsQuery,
};