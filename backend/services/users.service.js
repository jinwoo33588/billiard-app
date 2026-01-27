const User = require("../models/User");
const { HttpError } = require("../utils/httpError");

async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) throw new HttpError(404, "User not found");
  return user;
}

async function updateMyProfile(userId, patch) {
  const user = await getUserById(userId);

  if (patch.nickname !== undefined) user.nickname = patch.nickname;
  if (patch.handicap !== undefined) user.handicap = patch.handicap;

  await user.save();
  return user;
}

async function getMyHandicap(userId) {
  const u = await User.findById(userId).select("handicap");
  if (!u) throw new HttpError(404, "user not found");
  const h = Number(u.handicap);
  return Number.isFinite(h) ? h : 0; // 기본값 정책
}

module.exports = { getUserById, updateMyProfile, getMyHandicap };