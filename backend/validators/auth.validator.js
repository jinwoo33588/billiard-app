const { HttpError } = require("../utils/httpError");

function validateRegister(body) {
  const { email, password, nickname, handicap } = body;

  if (!email || !password || !nickname) {
    throw new HttpError(400, "email/password/nickname are required");
  }

  const h = Number(handicap);
  if (!Number.isFinite(h)) throw new HttpError(400, "handicap must be a number");
  if (h < 0 || h > 200) throw new HttpError(400, "handicap must be between 0 and 200");

  return {
    email: String(email).trim().toLowerCase(),
    password: String(password),
    nickname: String(nickname).trim(),
    handicap: h,
  };
}

function validateLogin(body) {
  const { email, password } = body;
  if (!email || !password) throw new HttpError(400, "email/password are required");

  return {
    email: String(email).trim().toLowerCase(),
    password: String(password),
  };
}

module.exports = { validateRegister, validateLogin };