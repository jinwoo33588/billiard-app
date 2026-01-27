const { HttpError } = require("../utils/httpError");
const { parseLimit } = require("../utils/parse");

const MODES = ["all", "thisMonth"];
const METRICS = ["avg", "winRate"];

function validateRankingQuery(query) {
  const mode = typeof query.mode === "string" ? query.mode : "thisMonth";
  if (!MODES.includes(mode)) throw new HttpError(400, "invalid mode");

  const metric = typeof query.metric === "string" ? query.metric : "avg";
  if (!METRICS.includes(metric)) throw new HttpError(400, "invalid metric");

  const limit = parseLimit(query.limit, { min: 1, max: 200 }) ?? 50;

  return { mode, metric, limit };
}

module.exports = { validateRankingQuery };