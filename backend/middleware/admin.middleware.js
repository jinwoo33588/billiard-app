const User = require("../models/User");
const { HttpError } = require("../utils/httpError");

function parseList(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}

const ADMIN_EMAILS = parseList(process.env.ADMIN_EMAILS);
const ADMIN_USER_IDS = parseList(process.env.ADMIN_USER_IDS);

async function adminMiddleware(req, res, next) {
  const userId = req.user?.userId;
  if (!userId) throw new HttpError(401, "Unauthorized");

  const userIdStr = String(userId);
  if (ADMIN_USER_IDS.length && ADMIN_USER_IDS.includes(userIdStr)) return next();

  if (ADMIN_EMAILS.length) {
    const user = await User.findById(userId).select("email").lean();
    if (user && ADMIN_EMAILS.includes(user.email)) return next();
  }

  if (!ADMIN_USER_IDS.length && !ADMIN_EMAILS.length) {
    // ✅ 로컬 개발 편의용(환경변수 없으면 통과)
    return next();
  }

  throw new HttpError(403, "Admin only");
}

module.exports = adminMiddleware;
