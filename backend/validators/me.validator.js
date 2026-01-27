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

module.exports = { validateUpdateMe };