const jwt = require("jsonwebtoken");
const mongoose = require("mongoose"); // ✅ 추가
const { HttpError } = require("../utils/httpError");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) throw new HttpError(401, "Unauthorized");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);

    // ✅ payload.userId가 ObjectId 문자열이어야 함
    if (!mongoose.isValidObjectId(payload.userId)) {
      throw new HttpError(401, "Invalid token");
    }

    // ✅ 여기서 표준화: 이후엔 req.user.userId는 항상 ObjectId
    req.user = {
      userId: new mongoose.Types.ObjectId(payload.userId),
      isGuest: payload.isGuest || false, // 게스트 플래그 추가
    };

    next();
  } catch {
    throw new HttpError(401, "Invalid token");
  }
}

module.exports = authMiddleware;
