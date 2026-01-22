const jwt = require("jsonwebtoken");
const { HttpError } = require("../utils/httpError");

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const [type, token] = header.split(" ");

  if (type !== "Bearer" || !token) throw new HttpError(401, "Unauthorized");

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = { userId: payload.userId };
    next();
  } catch {
    throw new HttpError(401, "Invalid token");
  }
}

module.exports = authMiddleware;