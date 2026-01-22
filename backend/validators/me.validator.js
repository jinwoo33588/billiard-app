const { HttpError } = require("../utils/httpError");

function validateUpdateMe(body) {
  const { nickname, handicap } = body;

  const patch = {};

  if (nickname !== undefined) {
    const n = String(nickname).trim();
    if (!n) throw new HttpError(400, "nickname cannot be empty");
    patch.nickname = n;
  }

  if (handicap !== undefined) {
    const h = Number(handicap);
    if (!Number.isFinite(h)) throw new HttpError(400, "handicap must be a number");
    if (h < 0 || h > 200) throw new HttpError(400, "handicap must be between 0 and 200");
    patch.handicap = h;
  }

  return patch;
}

function isYmd(s) {
  // 2026-01-22 형태만 허용
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function validateStatsQuery(req, res, next) {
  const { from, to } = req.query;

  if (from && !isYmd(from)) return next(require("../utils/httpError")(400, "invalid from (YYYY-MM-DD)"));
  if (to && !isYmd(to)) return next(require("../utils/httpError")(400, "invalid to (YYYY-MM-DD)"));

  next();
}


module.exports = { validateUpdateMe, validateStatsQuery };