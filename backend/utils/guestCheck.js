const { HttpError } = require("./httpError");

/**
 * 게스트 모드에서 쓰기 작업 방지 미들웨어
 * - 게스트(isGuest = true)인 경우 403 Forbidden 반환
 * - POST/PUT/DELETE 등 수정 작업이 필요한 엔드포인트에서 사용
 */
function guestCheckMiddleware(req, res, next) {
  if (req.user?.isGuest) {
    throw new HttpError(403, "Guest mode: write operations not allowed");
  }
  next();
}

module.exports = { guestCheckMiddleware };
